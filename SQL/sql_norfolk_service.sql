select
	trans_clean.service
,	trans_clean.date_calculated
,	sum(trans_clean.amount_calculated)
,	EXTRACT(YEAR FROM date_calculated) as YYYY
,	EXTRACT(MONTH FROM date_calculated) as MM 
from
	trans_clean
where	
	date_calculated > '2010-12-01' and
	trans_clean.entity_id = 'E2620_NCC_gov'
group by
	trans_clean.service
,	trans_clean.date_calculated
,	YYYY
,	MM
;
