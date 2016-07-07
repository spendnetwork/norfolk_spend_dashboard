select
  supplier_source_string,
  buyer_category_text1 as category,
  contract_end,
  value_total,
  contract_name as description
from
  pipeline.pipeline
where
  entity_id = 'E2620_NCC_gov' and
  contract_end >= '2016-06-01'
;
