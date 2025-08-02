import os
import smtplib
from datetime import datetime
from email.mime.text import MIMEText

from dotenv import load_dotenv

RECIPIENTS = [
    "farhanazam98@outlook.com", 
]


def generate_email():
    SMTP_SERVER = "smtp.gmail.com"
    SMTP_PORT = 587

    load_dotenv()
    SENDER_EMAIL = os.getenv("GMAIL_EMAIL")
    SENDER_PASSWORD = os.getenv("APP_PASSWORD")

    # Create email
    today = datetime.now().strftime("%Y-%m-%d")


# df is a 1 row data frame
def single_crash_email(df):
    # get the council district associated with this motor vehicle crash
    council_district = str(df.loc[0, "CounDist"])

    # get the street location of the crash
    location = str(df.loc[0, "cross_street_name"])
    # sometimes, cross_street is blank
    if location == "":
        location = (
            str(df.loc[0, "on_street_name"]) + " & " + str(df.loc[0, "off_street_name"])
        )

    # time of incident
    time_crash = str(df.loc[0, "crash_time"])

    today = datetime.now().strftime("%Y-%m-%d")

    msg = MIMEText(
        f"""Dear Council Member,

    On {today} at {time_crash}, there was a motor vehicle crash at {location} in your district that resulted in an injury.
    Since 2014, New York has adopted a Vision Zero policy affirming that motor vehicle crashes are preventable. Could this crash have been prevented?

    Thank you for your time and attention,
    The Crash Crew

    """
    )

    msg["Subject"] = f"Vision Zero: Injury Crash in District {council_district} {today}"
    msg["From"] = os.getenv("GMAIL_EMAIL")
    msg["To"] = ", ".join(RECIPIENTS)

    return msg


# placeholder for now
def multiple_crash_email(df):
    return "content of a daily email with multiple injury accidents"


# sends an email about an injury accident to the council member where that district occurred
def send_injury_email(df, council_district):
    generate_email()
    today = datetime.now().strftime("%Y-%m-%d")

    # get injury crashes from today in the given council district
    df_injury_cd_current = df[
        (df["crash_date"] == today)
        & (df["CounDist"] == council_district)
        & ((df["number_of_persons_injured"] + df["number_of_persons_killed"]) > 0)
    ]
    # if there were no injury accidents in the council district on this day, then return (don't send any emails)
    if df_injury_cd_current.shape[0] == 0:
        return
    # if there was exactly 1 injury accident, send that kind of email
    elif df_injury_cd_current.shape[0] == 1:
        msg = single_crash_email(df_injury_cd_current)
    else:
        msg = multiple_crash_email(df_injury_cd_current)

    SMTP_SERVER = "smtp.gmail.com"
    SMTP_PORT = 587
    SENDER_EMAIL = os.getenv("GMAIL_EMAIL")
    SENDER_PASSWORD = os.getenv("APP_PASSWORD")

    # Send email
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, msg["To"].split(", "), msg.as_string())

    print("Email sent!")


def send_crash_summary_email(summary):
    generate_email()

    today = datetime.now().strftime("%B %d, %Y")
    earliest_date = datetime.strptime(
        summary["date_range"]["earliest"], "%Y-%m-%dT%H:%M:%S.%f"
    ).strftime("%A, %B %d, %Y")
    latest_date = datetime.strptime(
        summary["date_range"]["latest"], "%Y-%m-%dT%H:%M:%S.%f"
    ).strftime("%A, %B %d, %Y")
    print(earliest_date, latest_date)
    total_crashes = summary["record_count"]

    msg = MIMEText(
        f"""
    Hello,

    This is a summary of collisions in New York City for {today}.
    The total number of crashes between {earliest_date} and {latest_date} was {total_crashes}."""
    )

    msg["Subject"] = f"New York Collision Summary for {today}"
    msg["From"] = os.getenv("GMAIL_EMAIL")
    msg["To"] = ", ".join(RECIPIENTS)

    SMTP_SERVER = "smtp.gmail.com"
    SMTP_PORT = 587
    SENDER_EMAIL = os.getenv("GMAIL_EMAIL")
    SENDER_PASSWORD = os.getenv("APP_PASSWORD")

    # Send email
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, msg["To"].split(", "), msg.as_string())

    print("Email sent!")
