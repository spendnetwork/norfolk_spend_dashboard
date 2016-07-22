# -*- coding: utf-8 -*-


import urlparse
import datetime as dt
import json
import os
import psycopg2
import requests
import sys
from string import printable

urlparse.uses_netloc.append("postgres")
url = urlparse.urlparse(os.environ['DATABASE_URL'])
H = 'D'  # create the leading column
dummy_data = 'x'
footer_count = 0
today = dt.date.today().strftime("%Y%m%d")
spend_cqc_dat = 'spend_cqc_' + today + '.dat'
spend_cqc_txt = 'spend_cqc_' + today + '_X.txt'
spend_cqc_dat_target = open(spend_cqc_dat, 'w')  ## a will append, w will over-write
spend_cqc_txt_target = open(spend_cqc_txt, 'w')

header = 'H' \
         '|CQC location id' \
         '|CQC name' \
         '|Also known as' \
         '|CQC provider name' \
         '|CQC provider id' \
         '|CQC address1' \
         '|CQC address2' \
         '|CQC posttown' \
         '|CQC county' \
         '|CQC postcode' \
         '|CQC phone number' \
         '|CQC service''s website' \
         '|CQC service types' \
         '|CQC specialism/services' \
         '|activities' \
         '|CQC local authority area' \
         '|CQC date of latest check' \
         '|CQC region' \
         '|CQC inspection rating' \
         '|CQC inspection area rating : safe' \
         '|CQC inspection area rating : effective' \
         '|CQC inspection area rating : caring' \
         '|CQC inspection area rating : responsive' \
         '|CQC inspection area rating : well-led' \
         '|number of registered beds' \
         '|CQC date archived' \
         '|dummy data' \
         '\n'
spend_cqc_dat_target.write(header)
spend_cqc_txt_target.write(header)

conn = psycopg2.connect(
    database=url.path[1:],
    user=url.username,
    password=url.password,
    host=url.hostname,
    port=url.port
)


def strip_non_ascii(string):
    ''' Returns the string without non ASCII characters'''
    stripped = (c for c in string if 0 < ord(c) < 127)
    return ''.join(stripped)


def json_field(jsonobj, default, *names):
    """

    :rtype : object
    """
    try:
        for name in names:
            jsonobj = jsonobj[name]
        return jsonobj or default
    except (TypeError, KeyError):
        return default

try:
    cur = conn.cursor()

    cur.execute(
        "select buyers_ref_for_supplier, cqc_location_id from trans_clean where entity_id = 'E2620_NCC_gov' and cqc_location_id is not null and supplier_id not like '%_xtr' and supplier_id not like '%red%' group by buyers_ref_for_supplier, cqc_location_id")  # get the ids from trans_clean
    sup_ids = cur.fetchall()
    print sup_ids

    for sup in sup_ids:
        vn_id = sup[0]

        if vn_id:
            vn_id
        else:
            vn_id = ''

        sn_id = sup[1]
        if sn_id.startswith('1-'):
            cqc_url = 'https://api.cqc.org.uk/public/v1/locations/' + sn_id
            cqc_r = requests.get(cqc_url)

            if cqc_r.status_code == 200:
                json_data = json.loads(cqc_r.text)
                # print json_data

                provider_id = json_field(json_data, '', 'providerId')
                provider_name = ''
                prov_url = 'https://api.cqc.org.uk/public/v1/providers/' + provider_id
                prov_r = requests.get(prov_url)

                if prov_r.status_code == 200:
                    prov_json = json.loads(prov_r.text)
                    provider_name = json_field(prov_json, '', 'name')
                    print 'provider_name: %s' % provider_name

                name = json_field(json_data, '', 'name')
                aka = json_field(json_data, '', 'alsoKnownAs')
                addr_1 = json_field(json_data, '', 'postalAddressLine1').encode('ascii', 'ignore').decode('ascii')
                addr_2 = json_field(json_data, '', 'postalAddressLine2')
                addr_town = json_field(json_data, '', 'postalAddressTownCity')
                addr_county = json_field(json_data, '', 'postalAddressCounty')
                addr_postcode = json_field(json_data, '', 'postalCode')
                phone = json_field(json_data, '', 'mainPhoneNumber')
                website = json_field(json_data, '', 'website')
                service_types = json_field(json_data, '', 'gacServiceTypes')
                specialisms = json_field(json_data, '', 'specialisms')
                activities = json_field(json_data, '', 'regulatedActivities')
                local_auth = json_field(json_data, '', 'localAuthority')
                last_check = json_field(json_data, '', 'lastReport', 'publicationDate')
                region = json_field(json_data, '', 'region')
                overall_rating = json_field(json_data, '', 'currentRatings','overall','rating')
                ind_ratings = json_field(json_data,'','currentRatings', 'overall', 'keyQuestionRatings')
                beds = json_field(json_data, '', 'numberOfBeds')
                dereg = json_field(json_data, '', 'deregistrationDate')

                safe_rating = ''
                caring_rating = ''
                well_led_rating = ''
                responsive_rating = ''
                effective_rating = ''

                for r in ind_ratings:
                    r_name = json_field(r, 'err', 'name')
                    r_rating = json_field(r, 'err', 'rating')
                    if r_name == 'Safe':
                        safe_rating = r_rating
                    if r_name == 'Caring':
                        caring_rating = r_rating
                    if r_name == 'Well-led':
                        well_led_rating = r_rating
                    if r_name == 'Responsive':
                        responsive_rating = r_rating
                    if r_name == 'Effective':
                        effective_rating = r_rating

                st_list = []
                for s in service_types:
                    st_type = json_field(s, '', 'name')
                    st_list.append(str(st_type))

                sp_list = []
                for s in specialisms:
                    special = json_field(s, '', 'name')
                    sp_list.append(str(special))

                act_list = []
                for a in activities:
                    activity = json_field(a, '', 'name')
                    act_list.append(str(activity))

                dat_line = "%s|" \
                           "%s|" \
                           "%s|" \
                           "%s|" \
                           "%s|" \
                           "%s|" \
                           "%s|" \
                           "%s|" \
                           "%s|" \
                           "%s|" \
                           "%s|" \
                           "%s|" \
                           "%s|" \
                           "%s|" \
                           "%s|" \
                           "%s|" \
                           "%s|" \
                           "%s|" \
                           "%s|" \
                           "%s|" \
                           "%s|" \
                           "%s|" \
                           "%s|" \
                           "%s|" \
                           "%s|" \
                           "%s|" \
                           "%s\n" % \
                           (H,
                            sn_id,
                            name,
                            aka,
                            provider_name,
                            provider_id,
                            addr_1,
                            addr_2,
                            addr_town,
                            addr_county,
                            addr_postcode,
                            phone,
                            website,
                            st_list,
                            sp_list,
                            act_list,
                            local_auth,
                            last_check,
                            region,
                            overall_rating,
                            safe_rating,
                            effective_rating,
                            caring_rating,
                            responsive_rating,
                            well_led_rating,
                            beds,
                            dereg
                            or '')
                print "region: %s" % region
                print "overall: %s" % overall_rating
                print "dereg %s" % dereg

                dat_line = strip_non_ascii(dat_line)
                spend_cqc_dat_target.write(dat_line)
                spend_cqc_txt_target.write(dat_line)

                footer_count += 1
                print 'footer_count: %s' %footer_count


    #write footers
    spend_cqc_dat_target.write('F|%s' % footer_count)
    spend_cqc_txt_target.write('F,%s' % footer_count)

    spend_cqc_dat_target.close()
    spend_cqc_txt_target.close()


except psycopg2.DatabaseError, e:
    print 'Error %s' % e
    sys.exit(1)

finally:
    if conn:
        conn.close()
