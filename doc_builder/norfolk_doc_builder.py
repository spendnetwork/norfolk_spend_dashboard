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
today = dt.date.today().strftime("%Y%m%d")
filename = 'spend_events_' + today + '.dat'
target = open(filename, 'w')  ## a will append, w will over-write
header = 'H|vendor_id|supplier_name|supplier_id|addr_line1|addr_line2|addr_line3|addr_post_town|addr_postcode|supplier_legal_form|close_date|open_date|accounts_category|accounts_next_due_date|dummy data\n'
target.write(header)

conn = psycopg2.connect(
    database=url.path[1:],
    user=url.username,
    password=url.password,
    host=url.hostname,
    port=url.port
)

try:
    cur = conn.cursor()

    cur.execute(
        "select buyers_ref_for_supplier, supplier_id from trans_clean where entity_id = 'E2620_NCC_gov' and supplier_id is not null group by buyers_ref_for_supplier, supplier_id limit 18;")  # get the ids from trans_clean
    sup_ids = cur.fetchall()


    for sup in sup_ids:
        vn_id = sup[0]

        if vn_id:
            vn_id
        else:
            vn_id = ''

        sn_id = sup[1]
        if sn_id.endswith('_com'):
            sn_id = sn_id.replace('_com', '')
            ch_url = 'http://data.companieshouse.gov.uk/doc/company/' + sn_id + '.json'
            oc_url = 'https://api.opencorporates.com/companies/gb/' + sn_id + '?api_token=yRWPAZuqdg7kTAoaD9sZ'

            ch_r = requests.get(ch_url)
            if ch_r.status_code == 200:
                json_data = json.loads(ch_r.text)
                try:
                    supplier_name = json_data['primaryTopic']['CompanyName']
                except:
                    supplier_name = ''

                try:
                    supplier_legal_form = json_data['primaryTopic']['CompanyCategory']
                    if supplier_legal_form:
                        pass
                    else:
                        supplier_legal_form = ''
                except:
                    supplier_legal_form = ''

                try:
                    addr_line1 = json_data['primaryTopic']['RegAddress']['AddressLine1']
                except:
                    addr_line1 = ''

                try:
                    addr_line2 = json_data['primaryTopic']['RegAddress']['AddressLine2']
                except:
                    addr_line2 = ''

                try:
                    addr_line3 = json_data['primaryTopic']['RegAddress']['AddressLine3']
                    if addr_line3:
                        pass
                    else:
                        addr_line3 = ''
                except:
                    addr_line3 = ''

                try:
                    addr_post_town = json_data['primaryTopic']['RegAddress']['PostTown']
                except:
                    addr_post_town = ''

                try:
                    addr_postcode = json_data['primaryTopic']['RegAddress']['Postcode']
                except:
                    addr_postcode = ''

                try:
                    open_date = json_data['primaryTopic']['IncorporationDate']
                except:
                    open_date = ''

                try:
                    close_date = json_data['primaryTopic']['DissolutionDate']
                except:
                    close_date = ''

                try:
                    accounts_category = json_data['primaryTopic']['Accounts']['AccountCategory']
                except:
                    accounts_category = ''

                try:
                    accounts_next_due_date = json_data['primaryTopic']['Accounts']['NextDueDate']
                    if accounts_next_due_date:
                        pass
                    else:
                        accounts_next_due_date = ''
                except:
                    accounts_next_due_date = ''

                print '--* starts *--'
                print supplier_name
                print addr_line1
                print addr_line2
                print addr_line3
                print addr_post_town
                print addr_postcode
                print supplier_legal_form
                print open_date
                print close_date
                print accounts_category
                print accounts_next_due_date

                line = H + '|' + vn_id + '|' + sn_id + '|' + supplier_name + '|' + addr_line1 + '|' + addr_line2 + '|' + addr_line3 + '|' + addr_post_town + '|' + addr_postcode + '|' + supplier_legal_form + '|' + open_date + '|' + close_date + '|' + accounts_category + '|' + accounts_next_due_date + '|' + dummy_data + '\n'
                target.write(line)

                print '--* ends *--'
                print ''

    target.close()

    for sup in sup_ids:
        vn_id = sup[0]

        if vn_id:
            vn_id
        else:
            vn_id = ''

        sn_id = sup[1]
        if sn_id.endswith('_com'):
            sn_id = sn_id.replace('_com', '')
            oc_url = 'https://api.opencorporates.com/companies/gb/' + sn_id + '?api_token=yRWPAZuqdg7kTAoaD9sZ'
            oc_r = requests.get(oc_url)
            if oc_r.status_code == 200:
                json_data = json.loads(oc_r.text)
                oc_data = json_data['results']['company']['filings']
                print oc_data

except psycopg2.DatabaseError, e:
    print 'Error %s' % e
    sys.exit(1)

finally:
    if conn:
        conn.close()
