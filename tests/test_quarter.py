import datetime
from importlib import reload

# We'll reimplement the getQuarterInfo logic from app.js here for testability.

def get_quarter_info(date: datetime.date):
    year = date.year
    month = date.month - 1  # make 0-indexed like JS Date
    day_of_year = (date - datetime.date(year, 1, 1)).days + 1

    if month < 3:
        quarter = 1
        week = (day_of_year + 6) // 7
    elif month < 6:
        quarter = 2
        week = (day_of_year - 90 + 6) // 7
    elif month < 9:
        quarter = 3
        week = (day_of_year - 181 + 6) // 7
    else:
        quarter = 4
        week = (day_of_year - 273 + 6) // 7

    return quarter, week


def test_q1_start():
    q, w = get_quarter_info(datetime.date(2025, 1, 1))
    assert q == 1
    assert w == 1


def test_q1_end():
    q, w = get_quarter_info(datetime.date(2025, 3, 31))
    assert q == 1
    assert w >= 12 and w <= 13


def test_q2_start():
    q, w = get_quarter_info(datetime.date(2025, 4, 1))
    assert q == 2
    assert w == 1


def test_q3_start():
    q, w = get_quarter_info(datetime.date(2025, 7, 1))
    assert q == 3
    assert w == 1


def test_q4_start():
    q, w = get_quarter_info(datetime.date(2025, 10, 1))
    assert q == 4
    assert w == 1
