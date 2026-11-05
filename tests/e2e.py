#!/usr/bin/env python3
# End-to-end check for the Rasoi Royale demo (headless Chromium via Playwright, Python).
# Usage: python3 tests/e2e.py http://localhost:8765/ [screenshot_dir]
# Checks: console errors, horizontal overflow at 390px, customer order -> admin board -> status back on customer,
# admin PIN login, menu price edit, item add/delete, integrations save, first-load page weight.
import sys
from playwright.sync_api import sync_playwright, expect

BASE = (sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8765/').rstrip('/') + '/'
OUT = sys.argv[2] if len(sys.argv) > 2 else None
PIN = '4321'
results = []

def check(name, ok, detail=''):
    results.append((name, bool(ok), detail))
    print(('PASS ' if ok else 'FAIL ') + name + ((' - ' + detail) if detail else ''))

def overflow(page):
    return page.evaluate('() => document.documentElement.scrollWidth - window.innerWidth')

def shot(page, name):
    if OUT:
        page.screenshot(path=OUT + '/' + name, type='jpeg', quality=82)

with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    errors = []
    cust = ctx.new_page()
    cust.on('console', lambda m: errors.append('console: ' + m.text) if m.type == 'error' else None)
    cust.on('pageerror', lambda e: errors.append('pageerror: ' + str(e)))
    cust.goto(BASE, wait_until='networkidle')
    expect(cust.locator('.hero h1')).to_be_visible()
    weight = cust.evaluate("() => performance.getEntriesByType('resource').reduce((n, r) => n + (r.transferSize || r.encodedBodySize || 0), 0)")
    check('first load weight under 2.5 MB', weight < 2.5 * 1024 * 1024, str(round(weight / 1024)) + ' KB (resources)')
    check('home: no horizontal overflow at 390px', overflow(cust) <= 0, 'overflow ' + str(overflow(cust)) + 'px')
    shot(cust, 'flagship-01.jpg')

    cust.click('.bottomnav button[data-tab="menu"]')
    expect(cust.locator('.item').first).to_be_visible()
    check('menu: no horizontal overflow', overflow(cust) <= 0, 'overflow ' + str(overflow(cust)) + 'px')
    cust.click('button[data-act="veg"][data-v="veg"]')
    veg_n = cust.locator('.item').count()
    cust.click('button[data-act="veg"][data-v="all"]')
    all_n = cust.locator('.item').count()
    check('menu: veg filter reduces list', 0 < veg_n < all_n, str(veg_n) + ' veg of ' + str(all_n))
    shot(cust, 'flagship-02.jpg')
    cust.locator('.item .itemtap').filter(has_text='Chicken Dum Biryani').first.click()
    expect(cust.locator('.sheet')).to_be_visible()
    cust.locator('.sheet input[value="Extra raita"]').check()
    cust.click('.sheet button[data-act="qinc"]')
    shot(cust, 'flagship-03.jpg')
    cust.click('.sheet button[data-act="addsheet"]')
    expect(cust.locator('.bottomnav em')).to_have_text('2')
    check('item sheet: add-on and qty land in cart badge', True, 'badge 2')

    cust.click('.bottomnav button[data-tab="cart"]')
    cust.fill('#coupon', 'ROYAL10')
    cust.click('button[data-act="applycoupon"]')
    cust.fill('#cname', 'Test Customer')
    cust.fill('#cphone', '9000012345')
    cust.fill('#addr', 'Test address, Bank More, Dhanbad')
    cust.locator('#cphone').blur()
    check('cart: no horizontal overflow', overflow(cust) <= 0, 'overflow ' + str(overflow(cust)) + 'px')
    shot(cust, 'flagship-04.jpg')
    cust.click('button[data-act="place"]')
    expect(cust.locator('.tracker')).to_be_visible()
    code = cust.locator('.tracker .code').inner_text()
    check('order placed: tracker shows code', code.startswith('RR'), code)
    shot(cust, 'flagship-05.jpg')

    adm = ctx.new_page()
    adm.on('console', lambda m: errors.append('admin console: ' + m.text) if m.type == 'error' else None)
    adm.on('pageerror', lambda e: errors.append('admin pageerror: ' + str(e)))
    adm.goto(BASE + 'admin/', wait_until='networkidle')
    adm.fill('#pin', PIN)
    adm.click('#loginform button')
    adm.click('[data-nav="orders"]')
    expect(adm.locator('.board')).to_be_visible()
    expect(adm.locator('.ticket', has_text=code)).to_be_visible(timeout=5000)
    check('admin: new order appears on live board', True, code)
    check('admin: no horizontal overflow (orders)', overflow(adm) <= 0, 'overflow ' + str(overflow(adm)) + 'px')
    shot(adm, 'flagship-06.jpg')
    adm.locator('.ticket', has_text=code).locator('button[data-to="accepted"]').click()
    expect(cust.locator('.tkmsg')).to_contain_text('accept', timeout=6000)
    check('customer: status moves to accepted after admin tap', True)
    adm.locator('.ticket', has_text=code).locator('button[data-to="cooking"]').click()
    expect(cust.locator('.steps li.now')).to_contain_text('Ban raha', timeout=6000)
    check('customer: status moves to cooking', True)

    adm.click('[data-nav="menu"]')
    row = adm.locator('tr[data-row]').filter(has_text='Butter Naan').first
    row.locator('input[data-field="price"]').fill('55')
    row.locator('input[data-field="price"]').dispatch_event('change')
    adm.wait_for_timeout(400)
    check('admin: price edit saved', adm.locator('tr[data-row]').filter(has_text='Butter Naan').first.locator('input[data-field="price"]').input_value() == '55')
    adm.evaluate('window.scrollTo(0, 0)')
    adm.click('button[data-act="newitem"]')
    adm.wait_for_selector('#di-name', timeout=5000)
    adm.fill('#di-name', 'Test Lassi (sample)')
    adm.fill('#di-price', '70')
    adm.click('button[data-act="saveitem"]')
    adm.wait_for_timeout(300)
    check('admin: add item', adm.locator('tr[data-row]', has_text='Test Lassi').count() == 1)
    shot(adm, 'flagship-07.jpg')
    adm.locator('tr[data-row]', has_text='Test Lassi').locator('button[data-act="delitem"]').click()
    adm.click('button[data-act="confirmyes"]')
    adm.wait_for_timeout(300)
    check('admin: delete item', adm.locator('tr[data-row]', has_text='Test Lassi').count() == 0)
    check('admin: menu no horizontal overflow', overflow(adm) <= 0, 'overflow ' + str(overflow(adm)) + 'px')

    adm.click('[data-nav="integrations"]')
    adm.fill('input[data-int="whatsapp"]', '919000000001')
    adm.click('button[data-act="saveint"]')
    adm.wait_for_timeout(300)
    check('admin: integrations saved', adm.locator('input[data-int="whatsapp"]').input_value() == '919000000001')
    shot(adm, 'flagship-08.jpg')
    adm.click('[data-nav="dashboard"]')
    check('admin: dashboard labelled as sample', adm.locator('.sample').count() >= 1)
    shot(adm, 'flagship-09.jpg')

    adm.click('[data-nav="orders"]')
    adm.locator('.ticket', has_text=code).locator('button[data-to="ready"]').click()
    adm.locator('.ticket', has_text=code).locator('button[data-to="out"]').click()
    expect(cust.locator('.steps li.now')).to_contain_text('Rasta', timeout=6000)
    check('customer: status moves to out for delivery', True)
    adm.locator('.ticket', has_text=code).locator('button[data-to="delivered"]').click()
    expect(cust.locator('.tkmsg')).to_contain_text('Mil gaya', timeout=6000)
    check('customer: delivered', True)

    other = ctx.new_page()
    other.goto(BASE + 'admin/', wait_until='networkidle')
    other.fill('#pin', '0000')
    other.click('#loginform button')
    check('admin: wrong PIN refused', other.locator('#loginform').count() == 1)

    real = [e for e in errors if 'Failed to load resource' not in e]
    check('no console errors', not real, '; '.join(real[:3]))
    browser.close()

fails = [r for r in results if not r[1]]
print('\n' + str(len(results) - len(fails)) + '/' + str(len(results)) + ' checks passed')
sys.exit(1 if fails else 0)
