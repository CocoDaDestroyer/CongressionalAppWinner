-- The neighborhood a shopper knows a store by ("Westwood", "Santa Monica").
-- Two stores of one chain are otherwise told apart only by street address.
alter table stores add column area text not null default '';
