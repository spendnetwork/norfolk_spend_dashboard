select
	supplier.org_type
,	trans_clean.date_calculated
,	sum(trans_clean.amount_calculated)
,	EXTRACT(YEAR FROM date_calculated) as YYYY
,	EXTRACT(MONTH FROM date_calculated) as MM 
from
	trans_clean
	  inner join supplier on trans_clean.supplier_id = supplier.supplier_id
where	
	date_calculated > '2010-12-01' and
	trans_clean.entity_id = 'E2620_NCC_gov' and
	supplier.org_type is not null
group by
	supplier.org_type
,	trans_clean.date_calculated
,	YYYY
,	MM
;
