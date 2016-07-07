select
	supplier.supplier_name
,	supplier.org_type
,	sum(tc_slim.amount_calculated)
,	EXTRACT(YEAR FROM date_calculated) as YYYY
from
	tc_slim
		join supplier on tc_slim.supplier_id = supplier.supplier_id
where	
	date_calculated > '2010-12-01' and
	supplier.supplier_id not like 'red%' and
	tc_slim.entity_id = 'E2620_NCC_gov'
group by
	supplier.supplier_name
,	supplier.org_type
,	YYYY
;
