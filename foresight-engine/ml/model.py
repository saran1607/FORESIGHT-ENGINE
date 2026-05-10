import sys
import json
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score
import warnings
warnings.filterwarnings('ignore')

def train_and_predict(csv_path):
    df = pd.read_csv(csv_path)
    df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')

    date_col    = next((c for c in df.columns if 'date' in c), None)
    product_col = next((c for c in df.columns if 'product' in c), None)
    qty_col     = next((c for c in df.columns if any(k in c for k in ['qty','quantity','units','sold'])), None)
    revenue_col = next((c for c in df.columns if any(k in c for k in ['revenue','sales','amount','price','total'])), None)

    if not all([date_col, product_col, qty_col, revenue_col]):
        raise ValueError(f"Could not detect required columns. Found: {list(df.columns)}")

    df[date_col]    = pd.to_datetime(df[date_col], dayfirst=True, errors='coerce')
    df              = df.dropna(subset=[date_col])
    df['month']     = df[date_col].dt.month
    df['year']      = df[date_col].dt.year
    df[qty_col]     = pd.to_numeric(df[qty_col], errors='coerce').fillna(0)
    df[revenue_col] = pd.to_numeric(df[revenue_col], errors='coerce').fillna(0)

    monthly = df.groupby(['year','month']).agg(
        total_qty=(qty_col,'sum'), total_revenue=(revenue_col,'sum')
    ).reset_index()
    monthly['month_index'] = range(len(monthly))

    product_summary = df.groupby(product_col).agg(
        total_qty=(qty_col,'sum'), total_revenue=(revenue_col,'sum')
    ).reset_index()

    X = monthly[['month_index','month']].values
    y_rev = monthly['total_revenue'].values
    y_qty = monthly['total_qty'].values

    if len(X) < 4:
        raise ValueError("Need at least 4 months of data.")

    X_train, X_test, yr_train, yr_test = train_test_split(X, y_rev, test_size=0.2, random_state=42)
    _, _, yq_train, _ = train_test_split(X, y_qty, test_size=0.2, random_state=42)

    rf = RandomForestRegressor(n_estimators=100, random_state=42)
    rf.fit(X_train, yr_train)
    r2 = r2_score(yr_test, rf.predict(X_test))
    confidence = round(max(0, min(r2 * 100, 99)), 1)

    lr = LinearRegression()
    lr.fit(X_train, yr_train)

    next_idx = len(monthly)
    next_month_num = (monthly['month'].iloc[-1] % 12) + 1
    next_X = np.array([[next_idx, next_month_num]])

    rf_qty = RandomForestRegressor(n_estimators=100, random_state=42)
    rf_qty.fit(X_train, yq_train)

    months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    monthly['label'] = monthly['month'].apply(lambda x: months[x-1]) + ' ' + monthly['year'].astype(str)

    print(json.dumps({
        "confidence": confidence,
        "predicted_revenue_rf": round(float(rf.predict(next_X)[0]), 2),
        "predicted_revenue_lr": round(float(lr.predict(next_X)[0]), 2),
        "predicted_qty": round(float(rf_qty.predict(next_X)[0])),
        "next_month": months[next_month_num - 1],
        "total_months": len(monthly),
        "avg_monthly_revenue": round(float(monthly['total_revenue'].mean()), 2),
        "avg_monthly_qty": round(float(monthly['total_qty'].mean())),
        "top_products": product_summary.nlargest(5,'total_qty')[[product_col,'total_qty','total_revenue']].to_dict('records'),
        "slow_products": product_summary.nsmallest(5,'total_qty')[[product_col,'total_qty','total_revenue']].to_dict('records'),
        "chart_data": monthly[['label','total_revenue','total_qty']].to_dict('records'),
        "product_col": product_col,
        "r2_score": round(r2, 4),
    }))

if __name__ == "__main__":
    train_and_predict(sys.argv[1])
