select
	supplier.supplier_name
,	sum(tc_slim.amount_calculated)
,	EXTRACT(YEAR FROM date_calculated) as YYYY
from
	tc_slim
		join supplier on tc_slim.supplier_id = supplier.supplier_id
where	
	date_calculated > '2010-12-01' and
	tc_slim.entity_id = 'E2620_NCC_gov' and
	supplier.org_type = 'SMALL BUSINESS' and
	tc_slim.amount_calculated is not null
group by
	supplier.supplier_name
,	YYYY
order by
  sum desc
;
