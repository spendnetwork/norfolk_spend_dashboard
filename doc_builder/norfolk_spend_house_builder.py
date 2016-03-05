import psycopg2
import urlparse
import requests
import datetime as dt
import csv
import json
import os

urlparse.uses_netloc.append("postgres")
url = urlparse.urlparse(os.environ['DATABASE_URL'])
H = 'D'  # create the leading column
dummy_data = 'x'
footer_count = 0
today = dt.date.today().strftime("%Y%m%d")
ch_num_invalid = 0

spend_house_dat = 'spend_house_' + today + '.dat'
spend_house_txt = 'spend_house_X_' + today + '.txt'
spend_house_dat_target = open(spend_house_dat, 'w')  ## a will append, w will over-write
spend_house_txt_target = open(spend_house_txt, 'w')

header = 'H|vendor_id|supplier_name|supplier_id|addr_line1|addr_line2|addr_line3|addr_post_town|addr_postcode|supplier_legal_form|close_date|open_date|accounts_category|accounts_next_due_date|dummy data\n'
spend_house_dat_target.write(header)
spend_house_txt_target.write(header)

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
        "select buyers_ref_for_supplier, supplier_industry_num from trans_clean where entity_id = 'E2620_NCC_gov' and supplier_industry_num is not null and buyers_ref_for_supplier is not null and lower(buyers_ref_for_supplier) not like '%redact%' group by buyers_ref_for_supplier, supplier_industry_num")  # get the ids from trans_clean
    sup_ids = cur.fetchall()


    for sup in sup_ids:
        vn_id = sup[0]

        if not vn_id:
            pass  # if not a string then don't run

        sn_id = sup[1]
        if sn_id[0] <> '0':
            sn_id = '0'+sn_id

        if sn_id.endswith('.0'):
            sn_id = sn_id.replace('.0','')

        ch_url = 'http://data.companieshouse.gov.uk/doc/company/' + sn_id + '.json'
        ch_r = requests.get(ch_url)
        if ch_r.status_code == 404:
            pass
        else:
            if ch_r.status_code == 200:
                if is_json(ch_r):
                    json_data = json.loads(ch_r.text)
                    supplier_name = json_field(json_data, '', 'primaryTopic', 'CompanyName')
                    supplier_legal_form = json_field(json_data, '', 'primaryTopic', 'CompanyCategory')
                    addr_line1 = json_field(json_data, '', 'primaryTopic', 'RegAddress','AddressLine1')
                    addr_line2 = json_field(json_data, '', 'primaryTopic', 'RegAddress','AddressLine2')
                    addr_line3 = json_field(json_data, '', 'primaryTopic', 'RegAddress','AddressLine3')
                    addr_post_town = json_field(json_data, '', 'primaryTopic', 'RegAddress','PostTown')
                    addr_postcode = json_field(json_data, '', 'primaryTopic', 'RegAddress','Postcode')
                    open_date = json_field(json_data, '', 'primaryTopic', 'IncorporationDate')
                    close_date = json_field(json_data, '', 'primaryTopic', 'DissolutionDate')
                    accounts_category = json_field(json_data, '', 'primaryTopic', 'Accounts','AccountCategory')
                    accounts_next_due_date = json_field(json_data, '', 'primaryTopic', 'Accounts','NextDueDate')

                    dat_line = "%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s\n" % (H, vn_id, sn_id[0:100], supplier_name[0:100], addr_line1, addr_line2, addr_line3[0:100], addr_post_town[0:200], addr_postcode, supplier_legal_form[0:100], open_date, close_date, accounts_category, accounts_next_due_date, dummy_data or '')
                    print dat_line
                    spend_house_dat_target.write(dat_line)
                    txt_line = dat_line.replace('|',',')
                    spend_house_txt_target.write(txt_line)
                    footer_count += 1
                else:
                    ch_num_invalid += 1
                    continue

    #write footers
    spend_house_dat_target.write('F|%s' % footer_count)
    spend_house_txt_target.write('F,%s' % footer_count)

    spend_house_dat_target.close()
    spend_house_txt_target.close()
    print 'ch_num_invalid: %s' %ch_num_invalid
    print 'footer_count: %s' %footer_count

except psycopg2.DatabaseError, e:
    print 'Error %s' % e
    sys.exit(1)

finally:
    if conn:
        conn.close()
