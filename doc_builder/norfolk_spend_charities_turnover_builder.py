import urlparse
import datetime as dt
import json
import os
import psycopg2
import requests

urlparse.uses_netloc.append("postgres")
url = urlparse.urlparse(os.environ['DATABASE_URL'])
H = 'D'  # create the leading column
dummy_data = 'x'
footer_count = 0
today = dt.date.today().strftime("%Y%m%d")
spend_charities_dat = 'spend_charities_turnover_' + today + '.dat'
spend_charities_txt = 'spend_charities_turnover_X_' + today + '.txt'
spend_charities_dat_target = open(spend_charities_dat, 'w')  ## a will append, w will over-write
spend_charities_txt_target = open(spend_charities_txt, 'w')
ch_num_invalid = 0

header = 'H|vendor_id|Charities Commission Number|Accounts Date|Income|Spending|dummy_data\n'
spend_charities_dat_target.write(header)
spend_charities_txt_target.write(header)

conn = psycopg2.connect(
    database=url.path[1:],
    user=url.username,
    password=url.password,
    host=url.hostname,
    port=url.port
)

def json_field(jsonobj, default, *names):
    try:
        for name in names:
             jsonobj = jsonobj[name]
        return jsonobj or default
    except (TypeError, KeyError):
        return default

def is_json(obj):
    try:
        json_object = json.loads(obj.text)
    except ValueError, e:
        return False
    return True

try:
    cur = conn.cursor()

    cur.execute(
        "select buyers_ref_for_supplier, charity_id from trans_clean where entity_id = 'E2620_NCC_gov' and charity_id is not null group by buyers_ref_for_supplier, charity_id;")  # get the ids from trans_clean
    sup_ids = cur.fetchall()
    print 'sup_ids: %s' %sup_ids

    for sup in sup_ids:
        vn_id = sup[0]

        if vn_id:
            vn_id
        else:
            vn_id = ''

        sn_id = sup[1]

        if sn_id.endswith('.0'):
            sn_id = sn_id.replace('.0','')
        oc_url = 'http://opencharities.org/charities/'+ sn_id + '.json'
        oc_r = requests.get(oc_url)
        print oc_url
        if oc_r.status_code == 404:
            print '404 err'
            pass
        else:
            if oc_r.status_code == 200:
                if is_json(oc_r):
                    json_data = json.loads(oc_r.text)
                    filings_list = json_field(json_data, 'err', 'charity', 'accounts')
                    for filing in filings_list:
                        fi_accounts_date = json_field(filing, '', 'accounts_date')
                        fi_income = json_field(filing, '', 'income')
                        fi_spending = json_field(filing, '', 'spending')

                        dat_line = "%s|%s|%s|%s|%s|%s|%s\n" % (H, vn_id, sn_id, fi_accounts_date, fi_income, fi_spending, dummy_data or '')
                        print dat_line
                        spend_charities_dat_target.write(dat_line)
                        txt_line = dat_line.replace('|',',')
                        spend_charities_txt_target.write(txt_line)

                        footer_count += 1
                else:
                    ch_num_invalid += 1
                    continue

    #write footers
    spend_charities_dat_target.write('F|%s' % footer_count)
    spend_charities_txt_target.write('F,%s' % footer_count)
    print 'ch_num_invalid: %s' %ch_num_invalid
    print 'footer_count: %s' %footer_count

    spend_charities_dat_target.close()
    spend_charities_txt_target.close()


except psycopg2.DatabaseError, e:
    print 'Error %s' % e
    sys.exit(1)

finally:
    if conn:
        conn.close()
