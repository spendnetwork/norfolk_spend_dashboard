select
	trans_clean.trans_type as "category"
,	sum(trans_clean.amount_calculated) as total_spend
,	EXTRACT(YEAR FROM date_calculated) as "YYYY"
from
	trans_clean
where	
	date_calculated > '2010-12-01' and
	trans_clean.entity_id = 'E2620_NCC_gov' 
group by
	"category"
,	"YYYY"
;
