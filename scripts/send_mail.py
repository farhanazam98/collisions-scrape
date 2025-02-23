import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv
import os
from datetime import datetime



def send_crash_summary(summary):
    SMTP_SERVER = "smtp.gmail.com"
    SMTP_PORT = 587

    load_dotenv()  
    SENDER_EMAIL = os.getenv("GMAIL_EMAIL")
    SENDER_PASSWORD = os.getenv("APP_PASSWORD")

    RECIPIENT_EMAIL = "farhanazam98@outlook.com"

    # Create email
    today = datetime.now().strftime('%Y-%m-%d')

    earliest_date = summary['date_range']['earliest']
    latest_date = summary['date_range']['latest']
    total_crashes = summary['record_count']
    msg = MIMEText(f"""Hello,

    This is a summary of collisions in New York City for {today}.
    The total number of crashes between {earliest_date} and {latest_date} was {total_crashes}""")
    msg["Subject"] = f"New York Collision Summary for {today}"
    msg["From"] = SENDER_EMAIL
    msg["To"] = RECIPIENT_EMAIL

    # Send email
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, RECIPIENT_EMAIL, msg.as_string())

    print("Email sent!")
