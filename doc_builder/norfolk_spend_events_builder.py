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
spend_events_dat = 'spend_events_' + today + '.dat'
spend_events_txt = 'spend_events_' + today + '_X.txt'
spend_events_dat_target = open(spend_events_dat, 'w')  ## a will append, w will over-write
spend_events_txt_target = open(spend_events_txt, 'w')

header = 'H|vendor_id|ch_num|filing/id|filing/uid|filing/date|filing/title|filing/description|filing/url|filing/filing_type|filing/opencorporates_url|filing/filing_code|dummy_data\n'
spend_events_dat_target.write(header)
spend_events_txt_target.write(header)

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
        "select buyers_ref_for_supplier, supplier_industry_num from trans_clean where entity_id = 'E2620_NCC_gov' and supplier_industry_num is not null and buyers_ref_for_supplier is not null group by buyers_ref_for_supplier, supplier_industry_num;")  # get the ids from trans_clean
    sup_ids = cur.fetchall()


    for sup in sup_ids:
        vn_id = sup[0]

        if vn_id:
            vn_id
        else:
            vn_id = ''

        sn_id = sup[1]
        if sn_id[0] <> '0':
            sn_id = '0'+sn_id

        if sn_id.endswith('.0'):
            sn_id = sn_id.replace('.0','')
        oc_url = 'https://api.opencorporates.com/companies/gb/' + sn_id + '?api_token=yRWPAZuqdg7kTAoaD9sZ'
        oc_r = requests.get(oc_url)
        print oc_url

        if oc_r.status_code == 404:
            print '404 err'
            pass
        else:
            if oc_r.status_code == 200:
                if is_json(oc_r):
                    json_data = json.loads(oc_r.text)
                    filings_list = json_field(json_data, 'err', 'results', 'company', 'filings')
                for filing in filings_list:
                    fi_id = json_field(filing, '', 'filing', 'id')
                    fi_uid = json_field(filing, '', 'filing', 'uid')
                    fi_date = json_field(filing, '', 'filing', 'date')
                    if json_field(filing, '', 'filing', 'title') == True:
                        continue
                    else:
                        fi_title = json_field(filing, '', 'filing', 'title').encode('ascii', 'ignore').decode('ascii')

                    fi_descr = json_field(filing, '', 'filing', 'description').encode('ascii', 'ignore').decode('ascii')
                    fi_url = json_field(filing, '', 'filing', 'url')
                    fi_type = json_field(filing, '', 'filing', 'filing_type_name').encode('ascii', 'ignore').decode('ascii')
                    fi_oc_url = json_field(filing, '', 'filing', 'opencorporates_url')
                    fi_code = json_field(filing, '', 'filing', 'filing_type_code')
                    fi_id = str(fi_id)

                    dat_line = "%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s\n" % (H, vn_id, sn_id, fi_id[0:100], fi_uid, fi_date, fi_title[0:100], fi_descr[0:200], fi_url, fi_type[0:100], fi_oc_url, fi_code, dummy_data or '')
                    print dat_line
                    spend_events_dat_target.write(dat_line)
                    spend_events_txt_target.write(dat_line)

                    footer_count += 1

    #write footers
    spend_events_dat_target.write('F|%s' % footer_count)
    spend_events_txt_target.write('F|%s' % footer_count)

    spend_events_dat_target.close()
    spend_events_txt_target.close()


except psycopg2.DatabaseError, e:
    print 'Error %s' % e
    sys.exit(1)

finally:
    if conn:
        conn.close()
