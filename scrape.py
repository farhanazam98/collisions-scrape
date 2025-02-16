from sodapy import Socrata
import pandas as pd
from datetime import datetime
import sys
import json

try:
    client = Socrata("data.cityofnewyork.us", None)
    
    today = datetime.now().strftime('%Y-%m-%d')
    
    # only pulling 1K for now. will probably need a key to bump this up? 
    query = """
    SELECT *
    ORDER BY crash_date DESC
    LIMIT 1000
    """
    
    results = client.get("h9gi-nx95", query=query)
    
    if not results:
        print("Error: No data retrieved!")
        sys.exit(1)
    
    df = pd.DataFrame.from_records(results)
    
    if 'location' in df.columns:
        df['location'] = df['location'].apply(lambda x: json.dumps(x) if isinstance(x, dict) else x)
    
    print(f"Retrieved {len(df)} records")
    print(f"Date range: {df['crash_date'].min()} to {df['crash_date'].max()}")
    print(f"Boroughs represented: {df['borough'].unique().tolist()}")
    
    output_file = 'latest_collisions.csv'
    df.to_csv(output_file, index=False)
    print(f"Data saved to {output_file}")
    
    summary = {
        'record_count': len(df),
        'date_range': {
            'earliest': df['crash_date'].min(),
            'latest': df['crash_date'].max()
        },
        'total_injured': df['number_of_persons_injured'].sum(),
        'total_killed': df['number_of_persons_killed'].sum(),
        'boroughs': df['borough'].value_counts().to_dict()
    }
    
    with open(f'summary_{today}.json', 'w') as f:
        json.dump(summary, f, indent=2)
        
except Exception as e:
    print(f"Error occurred: {str(e)}")
    sys.exit(1)