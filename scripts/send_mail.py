import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv
import os

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

load_dotenv()  
SENDER_EMAIL = os.getenv("GMAIL_EMAIL")
SENDER_PASSWORD = os.getenv("APP_PASSWORD")

RECIPIENT_EMAIL = "farhanazam98@outlook.com"

# Create email
msg = MIMEText("Hello, this is another test email.")
msg["Subject"] = "Test Email 2"
msg["From"] = SENDER_EMAIL
msg["To"] = RECIPIENT_EMAIL

# Send email
with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
    server.starttls()
    server.login(SENDER_EMAIL, SENDER_PASSWORD)
    server.sendmail(SENDER_EMAIL, RECIPIENT_EMAIL, msg.as_string())

print("Email sent!")
