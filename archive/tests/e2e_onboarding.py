#!/usr/bin/env python3
from playwright.sync_api import sync_playwright
import sys


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 375, "height": 812})

        # Direct Control path
        page.goto('http://localhost:8000', timeout=60000)
        page.click('text=Direct Control')
        page.wait_for_selector('text=Direct Control — Configure Aspects', timeout=10000)
        page.select_option('#direct-fitness-cardio', 'high')
        page.select_option('#direct-fitness-strength', 'medium')
        page.select_option('#direct-fitness-skills', 'low')
        page.click('#direct-continue')
        page.wait_for_selector('text=Your Quarter', timeout=10000)
        print('Direct path OK')

        # Identities path
        page.goto('http://localhost:8000', timeout=60000)
        page.click('text=Domain Identities')
        page.wait_for_selector('text=Domain Identities — Review & Tweak', timeout=10000)
        page.click('#identities-continue')
        page.wait_for_selector('text=Your Quarter', timeout=10000)
        print('Identities path OK')

        # Growth path
        page.goto('http://localhost:8000', timeout=60000)
        page.click('text=Growth Mode')
        page.wait_for_selector('text=Growth Mode — Tell us your current levels', timeout=10000)
        page.fill('#growth-cardio', '3')
        page.fill('#growth-strength', '2')
        page.fill('#growth-skills', '1')
        page.click('#growth-continue')
        page.wait_for_selector('text=Your Quarter', timeout=10000)
        print('Growth path OK')

        browser.close()
    return 0


if __name__ == '__main__':
    try:
        sys.exit(run())
    except Exception as e:
        print('ERROR:', e)
        sys.exit(1)
