select
	supplier.supplier_name
,	supplier.org_type
,	sum(trans_clean.amount_calculated)
,	EXTRACT(YEAR FROM date_calculated) as YYYY
from
	trans_clean
		join supplier on coalesce(trans_clean.supplier_id, LPAD(trans_clean.supplier_industry_num::text, 8, '0') || '_com') = supplier.supplier_id
where
	date_calculated > '2010-12-01' and
	supplier.supplier_id not like 'red%' and
	trans_clean.entity_id = 'E2620_NCC_gov'
group by
	supplier.supplier_name
,	supplier.org_type
,	YYYY;
