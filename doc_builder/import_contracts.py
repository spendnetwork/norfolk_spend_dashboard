import psycopg2
import urlparse
import os


# To get this script to work, you need to set up the csv first.
# Each column has to be renamed to match the column in the pipeline.pipeline table.
# The date columns must be set to yyyy-mm-dd format.
# Then add the header in brackets into the process_file call
# (if mapping hasn't changed this should work already).


urlparse.uses_netloc.append("postgres")
url = urlparse.urlparse(os.environ['DATABASE_URL'])

conn = psycopg2.connect(
    database=url.path[1:],
    user=url.username,
    password=url.password,
    host=url.hostname,
    port=url.port
)

sql_statement = """
    COPY %s FROM STDIN WITH
        CSV
        HEADER
        DELIMITER AS ','
    """


contracts_file = open("contracts_upload.csv")

def process_file(conn, table_name, file_object):
    cursor = conn.cursor()
    cursor.copy_expert(sql=sql_statement % table_name, file=file_object)
    conn.commit()
    cursor.close()

try:
    process_file(conn, 'pipeline.pipeline(entity_id,entity_name,entity_url,buyers_ref_for_contract,open_contracting_id,contract_name,contract_type,service,contract_description,buyer_category_text1,contract_cpv_lookup,buyer_category_text2,contract_start,contract_end,contract_review,last_extension_date,value_total,value_total_notes,vat,supplier_source_string,supplier_company_no,supplier_charity_no,buyers_ref_for_supplier,supplier_sme,supplier_vcse_status,supplier_vcse_type,contact_name,contact_email,contact_url,tender_type,tender_url,contract_url,location_url)', contracts_file)
finally:
    conn.close()

