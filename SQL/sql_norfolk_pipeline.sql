select
  supplier_source_string as supplier,
  contract_end as end_date,
  buyer_category_text1 as category,
  value_total as contract_value,
  contract_name as description
from
  pipeline.pipeline
where
  entity_id = 'E2620_NCC_gov' and
  contract_end >= now() - interval '1 month'
;
