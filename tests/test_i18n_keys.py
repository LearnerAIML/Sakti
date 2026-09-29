import re

with open('frontend/static/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract all data-i18n attributes
i18n_keys = set(re.findall(r'data-i18n="([^"]+)"', html))
i18n_placeholders = set(re.findall(r'data-i18n-placeholder="([^"]+)"', html))
i18n_htmls = set(re.findall(r'data-i18n-html="([^"]+)"', html))
i18n_titles = set(re.findall(r'data-i18n-title="([^"]+)"', html))

all_html_keys = i18n_keys | i18n_placeholders | i18n_htmls | i18n_titles

# Extract EN keys in I18N
en_match = re.search(r'en:\s*\{(.*?)\n\s*\},', html, re.DOTALL)
hi_match = re.search(r'hi:\s*\{(.*?)\n\s*\}', html, re.DOTALL)

en_keys = set(re.findall(r'^\s*([a-zA-Z0-9_]+):', en_match.group(1), re.MULTILINE)) if en_match else set()
hi_keys = set(re.findall(r'^\s*([a-zA-Z0-9_]+):', hi_match.group(1), re.MULTILINE)) if hi_match else set()

print(f'Total HTML keys: {len(all_html_keys)}')
print(f'Total EN dictionary keys: {len(en_keys)}')
print(f'Total HI dictionary keys: {len(hi_keys)}')

missing_in_en = all_html_keys - en_keys
missing_in_hi = all_html_keys - hi_keys

print('Missing in EN:', missing_in_en)
print('Missing in HI:', missing_in_hi)
assert not missing_in_en, f'Keys missing in EN: {missing_in_en}'
assert not missing_in_hi, f'Keys missing in HI: {missing_in_hi}'
print('[SUCCESS] 100% of HTML data-i18n keys are present in both EN and HI!')
