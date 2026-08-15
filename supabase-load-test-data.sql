-- WorkBuddy EMS — heavy load test data (3× volume, unique employee names)
-- Paste into Supabase SQL Editor and press Run. Safe to run again (idempotent).
-- It REPLACES the current data with a large generated dataset covering every
-- case the app handles. Logins still work: EMP001/1111, ADM001/0000,
-- IT001/5555, DRV01/1234. New employees use PIN 1234.
-- 14 base + 123 generated = 137 people, every name unique.

begin;

-- ============ 1. EMPLOYEES (14 base + 123 generated = 137, unique names) ============
-- Names are indexed pairs of 23 first × 23 last names: fi = i % 23, li = (i / 23) % 23,
-- so for i in 1..123 every (first, last) combination is distinct — no two
-- employees (including the 14 base ones) can ever share a name.
drop table if exists tmp_new_emps;
create temp table tmp_new_emps as
select
  'EMP' || lpad((10 + i)::text, 3, '0') as id,
  (array['Aarav','Vivaan','Aditya','Arnav','Druv','Kabir','Reyansh','Krishna','Ishaan','Rohan','Aanya','Diya','Kiara','Myra','Sara','Tara','Zara','Ira','Nia','Riya','Dev','Lakshay','Parth'])[mod(i - 1, 23) + 1]
  || ' ' ||
  (array['Sharma','Verma','Gupta','Patel','Nair','Iyer','Khan','Das','Sen','Mishra','Bhatt','Chauhan','Rana','Kapoor','Malik','Sood','Batra','Jain','Mehta','Chopra','Bansal','Gill','Sandhu'])[mod((i - 1) / 23, 23) + 1] as name,
  i,
  (array['Sales','Design','Support','Marketing','Operations','Quality'])[mod(i,6)+1] as dept,
  (array['Executive','Analyst','Associate','Specialist'])[mod(i,4)+1] as designation,
  i in (11,21,31,41,51) as is_manager,
  case when i in (11,21,31,41,51) then null
       else (array['EMP001','EMP006','EMP021','EMP031','EMP041','EMP051'])[mod(i,6)+1] end as manager_id,
  to_char(current_date - (45 + mod(i*37, 900)), 'YYYY-MM-DD') as date_joined,
  12000 + mod(i*13, 30)*1000 as basic,
  mod(i,5) <> 0 as wants_cab
from generate_series(1, 123) i;

insert into app_store (key, value)
select 'hr_employees', (
  '[{"id":"EMP001","name":"Arjun Mehta","pin":"1111","role":"employee","department":"Sales","isManager":true,"managerId":null,"email":"arjun.mehta@company.com","designation":"Sales Manager","dateJoined":"2024-06-10","salary":{"basic":45000,"hra":20000,"other":8000,"tdsMonthly":3000}},
    {"id":"EMP002","name":"Kavya Reddy","pin":"2222","role":"employee","department":"Design","isManager":false,"managerId":"EMP001","email":"kavya.reddy@company.com","designation":"UI Designer","dateJoined":"2025-03-15","salary":{"basic":22000,"hra":10000,"other":4000,"tdsMonthly":0}},
    {"id":"EMP003","name":"Sameer Joshi","pin":"3333","role":"employee","department":"Support","isManager":false,"managerId":"EMP001","email":"sameer.joshi@company.com","designation":"Support Executive","dateJoined":"2025-01-10","salary":{"basic":12000,"hra":5000,"other":2000,"tdsMonthly":0}},
    {"id":"EMP004","name":"Divya Menon","pin":"4444","role":"employee","department":"Sales","isManager":false,"managerId":"EMP001","email":"divya.menon@company.com","designation":"Sales Executive","dateJoined":"2024-11-01","salary":{"basic":16000,"hra":7000,"other":3000,"tdsMonthly":0}},
    {"id":"EMP005","name":"Rahul Verma","pin":"8888","role":"employee","department":"Marketing","isManager":false,"managerId":"EMP001","email":"rahul.verma@company.com","designation":"Marketing Associate","dateJoined":"2025-05-02","salary":{"basic":14000,"hra":6000,"other":2500,"tdsMonthly":0}},
    {"id":"EMP006","name":"Neha Kulkarni","pin":"9999","role":"employee","department":"Operations","isManager":true,"managerId":null,"email":"neha.kulkarni@company.com","designation":"Operations Manager","dateJoined":"2024-04-18","salary":{"basic":40000,"hra":18000,"other":7000,"tdsMonthly":2500}},
    {"id":"EMP007","name":"Aditya Rao","pin":"1010","role":"employee","department":"Operations","isManager":false,"managerId":"EMP006","email":"aditya.rao@company.com","designation":"Operations Executive","dateJoined":"2025-02-20","salary":{"basic":13000,"hra":5500,"other":2000,"tdsMonthly":0}},
    {"id":"EMP008","name":"Ishita Bose","pin":"2020","role":"employee","department":"Marketing","isManager":false,"managerId":"EMP001","email":"ishita.bose@company.com","designation":"Content Writer","dateJoined":"2025-06-09","salary":{"basic":15000,"hra":6500,"other":2500,"tdsMonthly":0}},
    {"id":"EMP009","name":"Karan Malhotra","pin":"3030","role":"employee","department":"Quality","isManager":false,"managerId":"EMP006","email":"karan.malhotra@company.com","designation":"QA Analyst","dateJoined":"2025-04-07","salary":{"basic":17000,"hra":7500,"other":3000,"tdsMonthly":0}},
    {"id":"EMP010","name":"Pooja Hegde","pin":"4040","role":"employee","department":"Human Resources","isManager":false,"managerId":"EMP006","email":"pooja.hegde@company.com","designation":"HR Executive","dateJoined":"2025-07-01","salary":{"basic":18000,"hra":8000,"other":3500,"tdsMonthly":0}},
    {"id":"ADM001","name":"Meera Kapoor","pin":"0000","role":"admin","department":"Human Resources","isManager":false,"managerId":null,"salary":{"basic":0,"hra":0,"other":0,"tdsMonthly":0}},
    {"id":"IT001","name":"Rajesh Kumar","pin":"5555","role":"it","department":"IT Support","isManager":false,"managerId":null,"salary":{"basic":20000,"hra":8000,"other":5000,"tdsMonthly":1000}},
    {"id":"IT002","name":"Anita Desai","pin":"6666","role":"it","department":"IT Support","isManager":false,"managerId":null,"salary":{"basic":18000,"hra":7000,"other":4000,"tdsMonthly":800}},
    {"id":"IT003","name":"Vikram Singh","pin":"7777","role":"it","department":"IT Support","isManager":true,"managerId":null,"salary":{"basic":25000,"hra":10000,"other":6000,"tdsMonthly":1500}}]'::jsonb
  || (select coalesce(jsonb_agg(
      jsonb_build_object(
        'id', id, 'name', name, 'pin', '1234', 'role', 'employee',
        'department', dept, 'isManager', is_manager, 'managerId', manager_id,
        'email', lower(replace(split_part(name,' ',1),' ','')) || '.' || lower(replace(split_part(name,' ',2),' ','')) || '@company.com',
        'designation', case when is_manager then dept || ' Manager' else designation end,
        'dateJoined', date_joined,
        'salary', jsonb_build_object(
          'basic', basic, 'hra', round(basic*0.45), 'other', 2000 + mod(i,5)*500,
          'tdsMonthly', case when basic > 30000 then 1500 else 0 end)
      ) order by id), '[]'::jsonb) from tmp_new_emps)
)
on conflict (key) do update set value = excluded.value, updated_at = now();

-- All non-admin people (base + new) for the generators below.
drop table if exists tmp_people;
create temp table tmp_people as
select * from (values
  ('EMP001', 1, null::text, true), ('EMP002', 2, 'EMP001', true), ('EMP003', 3, 'EMP001', true),
  ('EMP004', 4, 'EMP001', true), ('EMP005', 5, 'EMP001', true), ('EMP006', 6, null, true),
  ('EMP007', 7, 'EMP006', true), ('EMP008', 8, 'EMP001', true), ('EMP009', 9, 'EMP006', true),
  ('EMP010', 10, 'EMP006', true), ('IT001', 91, null, true), ('IT002', 92, null, true),
  ('IT003', 93, null, true)
) as v(id, i, manager_id, wants_cab)
union all
select id, i + 100, manager_id, wants_cab from tmp_new_emps;

-- ============ 2. ATTENDANCE (~25,000 rows, 200 days × 137 people) ============
insert into app_store (key, value)
select 'hr_attendance', coalesce(jsonb_agg(rec order by emp_id, day), '[]'::jsonb)
from (
  select
    p.id as emp_id, d.day,
    jsonb_build_object(
      'id', 'ATT' || lpad(row_number() over (order by p.id, d.day)::text, 5, '0'),
      'employeeId', p.id,
      'date', to_char(d.day, 'YYYY-MM-DD'),
      'timeIn', to_char(d.day + make_interval(mins => 530 + mod(p.i*7 + d.di*13, 75)), 'YYYY-MM-DD"T"HH24:MI:SS'),
      'timeOut', case
        when d.day = current_date and mod(p.i, 2) = 0 then null
        else to_char(d.day + make_interval(mins => 1050 + mod(p.i*5 + d.di*11, 85)), 'YYYY-MM-DD"T"HH24:MI:SS')
      end,
      'breaks', case
        when d.day = current_date and mod(p.i, 2) = 0 and mod(p.i, 4) = 0 then
          jsonb_build_array(jsonb_build_object(
            'start', to_char(d.day + make_interval(mins => 780 + mod(p.i, 30)), 'YYYY-MM-DD"T"HH24:MI:SS'),
            'end', null))
        else jsonb_build_array(jsonb_build_object(
            'start', to_char(d.day + make_interval(mins => 780 + mod(p.i*3 + d.di, 35)), 'YYYY-MM-DD"T"HH24:MI:SS'),
            'end',   to_char(d.day + make_interval(mins => 805 + mod(p.i*3 + d.di, 35) + 25 + mod(p.i + d.di, 25)), 'YYYY-MM-DD"T"HH24:MI:SS')))
      end
    ) as rec
  from tmp_people p
  cross join (
    select gs::date as day, row_number() over (order by gs)::int as di
    from generate_series(current_date - 200, current_date, interval '1 day') gs
    where extract(dow from gs) between 1 and 5
  ) d
  where mod(p.i*31 + d.di*17, 100) > 7
) x
on conflict (key) do update set value = excluded.value, updated_at = now();

-- ============ 3. LEAVES (every type, status and stage, 9 per employee) ============
insert into app_store (key, value)
select 'hr_leaves', coalesce(jsonb_agg(rec order by rn), '[]'::jsonb)
from (
  -- generated: 9 per new employee
  select row_number() over (order by p.id, k)::int as rn,
    jsonb_build_object(
      'id', 'LV' || lpad(row_number() over (order by p.id, k)::text, 4, '0'),
      'employeeId', p.id,
      'type', (array['casual','sick','earned','halfday','short','unpaid'])[mod(p.i + k, 6) + 1],
      'halfDayPart', case when (array['casual','sick','earned','halfday','short','unpaid'])[mod(p.i + k, 6) + 1] = 'halfday'
                          then (array['first','second'])[mod(p.i, 2) + 1] else null end,
      'fromDate', to_char(current_date + (mod(p.i + k*5, 24) - 12), 'YYYY-MM-DD'),
      'toDate', case when (array['casual','sick','earned','halfday','short','unpaid'])[mod(p.i + k, 6) + 1] in ('halfday','short')
                     then to_char(current_date + (mod(p.i + k*5, 24) - 12), 'YYYY-MM-DD')
                     else to_char(current_date + (mod(p.i + k*5, 24) - 12) + mod(k, 3), 'YYYY-MM-DD') end,
      'reason', (array['Personal work','Family function','Medical appointment','Out of station','Festival at home town','Bank and paper work'])[mod(p.i + k, 6) + 1],
      'status', (array['pending','approved','rejected','withdrawn'])[mod(p.i + k, 4) + 1],
      'stage', case when (array['pending','approved','rejected','withdrawn'])[mod(p.i + k, 4) + 1] = 'pending'
                    then case when mod(p.i + k, 8) = 0 then 'hr' else 'manager' end else null end,
      'managerStatus', case when mod(p.i + k, 8) = 0 then 'approved' else null end,
      'appliedOn', to_char(current_date - (1 + mod(p.i + k*3, 9)), 'YYYY-MM-DD'),
      'decidedBy', case when (array['pending','approved','rejected','withdrawn'])[mod(p.i + k, 4) + 1] in ('approved','rejected') then 'ADM001' else null end,
      'decidedOn', case when (array['pending','approved','rejected','withdrawn'])[mod(p.i + k, 4) + 1] in ('approved','rejected') then to_char(current_date - mod(p.i + k, 5), 'YYYY-MM-DD') else null end,
      'rejectionReason', case when (array['pending','approved','rejected','withdrawn'])[mod(p.i + k, 4) + 1] = 'rejected' then 'Please plan this with your manager in advance.' else '' end,
      'withdrawnOn', case when (array['pending','approved','rejected','withdrawn'])[mod(p.i + k, 4) + 1] = 'withdrawn' then to_char(current_date - 1, 'YYYY-MM-DD') else null end,
      'messages', '[]'::jsonb
    ) as rec
  from tmp_people p cross join generate_series(1, 9) k
  where p.id like 'EMP%'
  union all
  -- hand-picked cases for the demo logins
  select 9001, jsonb_build_object(
    'id', 'LV9001', 'employeeId', 'EMP002', 'type', 'earned',
    'fromDate', to_char(current_date + 5, 'YYYY-MM-DD'),
    'toDate', to_char(current_date + 7, 'YYYY-MM-DD'),
    'reason', 'Family function', 'status', 'pending', 'stage', 'manager',
    'appliedOn', to_char(current_date - 1, 'YYYY-MM-DD'),
    'decidedBy', null, 'decidedOn', null, 'messages', '[]'::jsonb, 'rejectionReason', '')
  union all
  select 9002, jsonb_build_object(
    'id', 'LV9002', 'employeeId', 'EMP003', 'type', 'casual',
    'fromDate', to_char(current_date + 2, 'YYYY-MM-DD'),
    'toDate', to_char(current_date + 2, 'YYYY-MM-DD'),
    'reason', 'Personal work', 'status', 'pending', 'stage', 'manager',
    'appliedOn', to_char(current_date - 5, 'YYYY-MM-DD'),
    'decidedBy', null, 'decidedOn', null, 'messages', '[]'::jsonb, 'rejectionReason', '')
  union all
  select 9003, jsonb_build_object(
    'id', 'LV9003', 'employeeId', 'EMP004', 'type', 'sick',
    'fromDate', to_char(current_date + 1, 'YYYY-MM-DD'),
    'toDate', to_char(current_date + 2, 'YYYY-MM-DD'),
    'reason', 'Fever', 'status', 'pending', 'stage', 'hr',
    'managerStatus', 'approved', 'managerDecidedBy', 'EMP001',
    'managerDecidedOn', to_char(current_date, 'YYYY-MM-DD'),
    'appliedOn', to_char(current_date - 1, 'YYYY-MM-DD'),
    'decidedBy', null, 'decidedOn', null,
    'supportingDocuments', jsonb_build_array(jsonb_build_object(
      'name', 'clinic-note.pdf', 'size', 98000, 'type', 'application/pdf',
      'uploadedOn', to_char(current_date - 1, 'YYYY-MM-DD'))),
    'messages', '[]'::jsonb, 'rejectionReason', '')
  union all
  select 9004, jsonb_build_object(
    'id', 'LV9004', 'employeeId', 'EMP002', 'type', 'halfday', 'halfDayPart', 'first',
    'fromDate', to_char(current_date - 3, 'YYYY-MM-DD'),
    'toDate', to_char(current_date - 3, 'YYYY-MM-DD'),
    'reason', 'Doctor appointment', 'status', 'approved',
    'appliedOn', to_char(current_date - 4, 'YYYY-MM-DD'),
    'decidedBy', 'ADM001', 'decidedOn', to_char(current_date - 4, 'YYYY-MM-DD'),
    'messages', '[]'::jsonb, 'rejectionReason', '')
  union all
  select 9005, jsonb_build_object(
    'id', 'LV9005', 'employeeId', 'EMP004', 'type', 'unpaid',
    'fromDate', to_char(current_date - 6, 'YYYY-MM-DD'),
    'toDate', to_char(current_date - 4, 'YYYY-MM-DD'),
    'reason', 'Personal emergency', 'status', 'approved',
    'appliedOn', to_char(current_date - 8, 'YYYY-MM-DD'),
    'decidedBy', 'ADM001', 'decidedOn', to_char(current_date - 7, 'YYYY-MM-DD'),
    'messages', '[]'::jsonb, 'rejectionReason', '')
) x
on conflict (key) do update set value = excluded.value, updated_at = now();

-- ============ 4. TASKS (~2,400, all statuses, overdue, threads) ============
insert into app_store (key, value)
select 'hr_tasks', coalesce(jsonb_agg(rec order by id, k), '[]'::jsonb)
from (
  select p.id, k,
    jsonb_build_object(
      'id', 'TSK' || lpad((row_number() over (order by p.id, k))::text, 4, '0'),
      'title', (array['Prepare monthly report','Call new leads','Update design mockups','Reply to pending emails','Plan next week','Submit expense sheet','Prepare review deck','Upload final assets','Organise file library','Review checklist'])[mod(p.i + k, 10) + 1],
      'description', 'Generated load-test task number ' || k || ' with full description text for width testing.',
      'assigneeId', p.id,
      'createdById', case when mod(p.i + k, 6) = 5 then p.id else coalesce(p.manager_id, p.id) end,
      'dueDate', to_char(current_date + (mod(p.i + k*7, 21) - 10), 'YYYY-MM-DD'),
      'priority', (array['low','medium','high'])[mod(p.i + k, 3) + 1],
      'status', (array['todo','inprogress','done','closed','todo','inprogress'])[mod(p.i + k, 6) + 1],
      'createdOn', to_char(current_date - (1 + mod(p.i + k, 12)), 'YYYY-MM-DD'),
      'completedOn', case when (array['todo','inprogress','done','closed','todo','inprogress'])[mod(p.i + k, 6) + 1] in ('done','closed') then to_char(current_date - mod(p.i + k, 4), 'YYYY-MM-DD') else null end,
      'closedBy', case when (array['todo','inprogress','done','closed','todo','inprogress'])[mod(p.i + k, 6) + 1] = 'closed' then coalesce(p.manager_id, p.id) else null end,
      'closedOn', case when (array['todo','inprogress','done','closed','todo','inprogress'])[mod(p.i + k, 6) + 1] = 'closed' then to_char(current_date - mod(p.i + k, 3), 'YYYY-MM-DD') else null end,
      'messages', case when mod(p.i + k, 4) = 0 then jsonb_build_array(jsonb_build_object(
          'id', 'TSM' || p.i || k, 'byId', coalesce(p.manager_id, p.id),
          'text', 'Please prioritise this before the review meeting.', 'on', to_char(current_date - 1, 'YYYY-MM-DD')))
        else '[]'::jsonb end
    ) as rec
  from tmp_people p cross join generate_series(1, 18) k
) x
on conflict (key) do update set value = excluded.value, updated_at = now();

-- ============ 5. TICKETS (queries + grievances incl. POSH, 6 per employee) ============
insert into app_store (key, value)
select 'hr_tickets', coalesce(jsonb_agg(rec order by id, k), '[]'::jsonb)
from (
  select p.id, k,
    jsonb_build_object(
      'id', 'TKT' || lpad((row_number() over (order by p.id, k))::text, 4, '0'),
      'kind', case when mod(p.i + k, 4) = 3 then 'grievance' else 'query' end,
      'category', case
        when mod(p.i + k, 4) = 3 then (array['against_person','posh','compensation','disciplinary','grievance_other'])[mod(p.i, 5) + 1]
        else (array['payslip','leave','pfuan','form16','policy','itasset','query_other'])[mod(p.i + k, 7) + 1] end,
      'subject', (array['Doubt about this month payslip','Leave balance not matching','PF passbook issue','Form 16 request','WFH policy question','Second monitor request','Workload concern','Other question'])[mod(p.i + k, 8) + 1],
      'status', (array['open','inprogress','resolved','closed','withdrawn'])[mod(p.i + k, 5) + 1],
      'employeeId', p.id,
      'anonymous', mod(p.i + k, 4) = 3 and mod(p.i, 5) = 1,
      'confidential', mod(p.i + k, 4) = 3,
      'createdOn', to_char(current_date - mod(p.i + k*3, 15), 'YYYY-MM-DD'),
      'updatedOn', to_char(current_date - mod(p.i + k, 5), 'YYYY-MM-DD'),
      'messages', jsonb_build_array(jsonb_build_object(
        'id', 'MSG' || p.i || k, 'byId', p.id, 'byRole', 'employee',
        'text', 'I would like help with this matter please.', 'on', to_char(current_date - mod(p.i + k*3, 15), 'YYYY-MM-DD')))
    ) as rec
  from tmp_people p cross join generate_series(1, 6) k
  where p.id like 'EMP%'
) x
on conflict (key) do update set value = excluded.value, updated_at = now();

-- ============ 6. IT ISSUES (all categories / statuses, 6 per employee) ============
insert into app_store (key, value)
select 'hr_it_issues', coalesce(jsonb_agg(rec order by id, k), '[]'::jsonb)
from (
  select p.id, k,
    jsonb_build_object(
      'id', 'ITI' || lpad((row_number() over (order by p.id, k))::text, 4, '0'),
      'employeeId', p.id,
      'issue', (array['Laptop not starting','Internet slow','Printer not working','Monitor flickering','Email login failing','VPN disconnects','Keyboard sticking','Software licence error'])[mod(p.i + k, 8) + 1],
      'description', 'Generated load-test IT issue with a longer description so the UI wrapping can be tested properly.',
      'category', (array['hardware','software','network','email','other'])[mod(p.i + k, 5) + 1],
      'priority', (array['low','medium','high'])[mod(p.i + k*2, 3) + 1],
      'status', (array['open','inprogress','resolved','closed','withdrawn'])[mod(p.i + k, 5) + 1],
      'assignedTo', case when mod(p.i + k, 5) in (1, 2) then (array['IT001','IT002','IT003'])[mod(p.i, 3) + 1] else null end,
      'estimatedTime', case when mod(p.i + k, 5) in (1, 2) then (array['30 minutes','1 hour','2 hours','4 hours'])[mod(p.i + k, 4) + 1] else null end,
      'attachment', null,
      'comments', case when mod(p.i + k, 3) = 0 then jsonb_build_array(jsonb_build_object(
          'id', 'ITIC' || p.i || k, 'byId', 'IT001', 'byName', 'Rajesh Kumar', 'byRole', 'it',
          'text', 'We are looking into it and will update you shortly.', 'on', to_char(current_date - 1, 'YYYY-MM-DD')))
        else '[]'::jsonb end,
      'createdOn', to_char(current_date - mod(p.i + k*2, 12), 'YYYY-MM-DD'),
      'updatedOn', to_char(current_date - mod(p.i + k, 4), 'YYYY-MM-DD')
    ) as rec
  from tmp_people p cross join generate_series(1, 6) k
  where p.id like 'EMP%'
) x
on conflict (key) do update set value = excluded.value, updated_at = now();

-- ============ 7. REIMBURSEMENTS (all statuses, 6 per employee) ============
insert into app_store (key, value)
select 'hr_reimbursements', coalesce(jsonb_agg(rec order by id, k), '[]'::jsonb)
from (
  select p.id, k,
    jsonb_build_object(
      'id', 'RMB' || lpad((row_number() over (order by p.id, k))::text, 4, '0'),
      'employeeId', p.id,
      'category', (array['conveyance','travel','meals','office','other'])[mod(p.i + k, 5) + 1],
      'expenseDate', to_char(current_date - (2 + mod(p.i + k*5, 40)), 'YYYY-MM-DD'),
      'amount', 200 + mod(p.i*13 + k*97, 28)*100,
      'description', 'Generated load-test expense claim with a detailed description line.',
      'status', (array['pending','approved_unpaid','paid','rejected','withdrawn'])[mod(p.i + k, 5) + 1],
      'appliedOn', to_char(current_date - (1 + mod(p.i + k, 20)), 'YYYY-MM-DD'),
      'decidedBy', case when mod(p.i + k, 5) in (1, 2, 3) then 'ADM001' else null end,
      'decidedOn', case when mod(p.i + k, 5) in (1, 2, 3) then to_char(current_date - mod(p.i + k, 7), 'YYYY-MM-DD') else null end,
      'paidOn', case when mod(p.i + k, 5) = 2 then to_char(current_date - mod(p.i + k, 5), 'YYYY-MM-DD') else null end,
      'reviewNote', case when mod(p.i + k, 5) = 3 then 'Please use the office supply request process instead.' else '' end
    ) as rec
  from tmp_people p cross join generate_series(1, 6) k
  where p.id like 'EMP%'
) x
on conflict (key) do update set value = excluded.value, updated_at = now();

-- ============ 8. ATTENDANCE CORRECTIONS (all issue types/statuses, 6 per employee) ============
insert into app_store (key, value)
select 'hr_attendance_corrections', coalesce(jsonb_agg(rec order by id, k), '[]'::jsonb)
from (
  select p.id, k,
    jsonb_build_object(
      'id', 'ACR' || lpad((row_number() over (order by p.id, k))::text, 4, '0'),
      'employeeId', p.id,
      'date', to_char(current_date - (2 + mod(p.i + k*7, 30)), 'YYYY-MM-DD'),
      'issueType', (array['missed_time_in','missed_time_out','wrong_times','wrong_break','other'])[mod(p.i + k, 5) + 1],
      'description', 'Generated correction request explaining what went wrong with the punch.',
      'suggestedTimeIn', case when mod(p.i + k, 2) = 0 then '09:' || lpad(mod(p.i + k*3, 50)::text, 2, '0') else null end,
      'suggestedTimeOut', case when mod(p.i + k, 2) = 1 then '18:' || lpad(mod(p.i + k*5, 50)::text, 2, '0') else null end,
      'status', (array['pending','approved','rejected','withdrawn'])[mod(p.i + k, 4) + 1],
      'appliedOn', to_char(current_date - (1 + mod(p.i + k, 15)), 'YYYY-MM-DD'),
      'decidedBy', case when mod(p.i + k, 4) in (1, 2) then 'ADM001' else null end,
      'decidedOn', case when mod(p.i + k, 4) in (1, 2) then to_char(current_date - mod(p.i + k, 5), 'YYYY-MM-DD') else null end,
      'reviewNote', case when mod(p.i + k, 4) = 2 then 'Approved. Attendance updated.' else '' end,
      'messages', '[]'::jsonb
    ) as rec
  from tmp_people p cross join generate_series(1, 6) k
  where p.id like 'EMP%'
) x
on conflict (key) do update set value = excluded.value, updated_at = now();

-- ============ 9. PROFILES (verified / submitted / returned for every new employee) ============
insert into app_store (key, value)
select 'hr_profiles', (
  (select coalesce(jsonb_agg(elem), '[]'::jsonb)
   from jsonb_array_elements(coalesce((select value from app_store where key = 'hr_profiles'), '[]'::jsonb)) elem
   where elem->>'employeeId' in ('EMP001','EMP002','EMP003','EMP004','EMP005','EMP006','EMP007','EMP008','EMP009','EMP010'))
  || coalesce((select jsonb_agg(rec order by id) from (
      select n.id,
        jsonb_build_object(
          'employeeId', n.id,
          'status', (array['verified','submitted','returned'])[mod(n.i, 3) + 1],
          'updatedOn', to_char(current_date - 2, 'YYYY-MM-DD'),
          'submittedOn', to_char(current_date - 4, 'YYYY-MM-DD'),
          'reviewedBy', case when mod(n.i, 3) = 0 then 'ADM001' else '' end,
          'reviewedOn', case when mod(n.i, 3) = 0 then to_char(current_date - 2, 'YYYY-MM-DD') else '' end,
          'reviewNote', case when mod(n.i, 3) = 2 then 'PAN card copy is blurred. Please re-upload a clearer scan.' else '' end,
          'personal', jsonb_build_object(
            'fullName', n.name, 'dob', '199' || mod(n.i, 9) || '-0' || (mod(n.i, 8) + 1) || '-1' || mod(n.i, 9),
            'address', (n.i*7) || ' Sector ' || (10 + mod(n.i, 60)) || ', Gurugram',
            'contactNumber', '98' || lpad((1000000 + n.i*137)::text, 8, '0'),
            'emergencyName', 'Emergency Contact', 'emergencyRelation', 'Family',
            'emergencyContact', '97' || lpad((2000000 + n.i*139)::text, 8, '0'),
            'aadhaar', lpad((100000000000 + n.i*997)::text, 12, '0'),
            'pan', 'ABCP' || lpad(n.i::text, 4, '0') || 'K',
            'homeGate', 'Gate ' || (mod(n.i, 6) + 1),
            'wantsCabService', n.wants_cab,
            'pickupPoint', jsonb_build_object('lat', 28.4 + mod(n.i, 40)*0.01, 'lng', 77.0 + mod(n.i, 50)*0.01),
            'dropPoint', null, 'dropSameAsPickup', true, 'photo', null),
          'bank', jsonb_build_object('accountNumber', lpad((50100000000000 + n.i*123)::text, 14, '0'), 'ifsc', 'HDFC000' || lpad(n.i::text, 3, '0'), 'bankName', 'HDFC Bank'),
          'statutory', jsonb_build_object('uan', lpad((100000000000 + n.i*77)::text, 12, '0'), 'esicApplicable', n.basic <= 21000, 'esic', case when n.basic <= 21000 then lpad((3100000000 + n.i)::text, 10, '0') else '' end, 'nomineeName', 'Nominee', 'nomineeRelation', 'Spouse', 'nomineeShare', '100'),
          'documents', case when mod(n.i, 3) = 0 then jsonb_build_object(
              'panCard', jsonb_build_array(jsonb_build_object('name', 'pan.pdf', 'size', 120000, 'type', 'application/pdf', 'uploadedOn', to_char(current_date - 4, 'YYYY-MM-DD'))),
              'aadhaarCard', jsonb_build_array(jsonb_build_object('name', 'aadhaar.pdf', 'size', 200000, 'type', 'application/pdf', 'uploadedOn', to_char(current_date - 4, 'YYYY-MM-DD'))),
              'educational', jsonb_build_array(jsonb_build_object('name', 'degree.pdf', 'size', 300000, 'type', 'application/pdf', 'uploadedOn', to_char(current_date - 4, 'YYYY-MM-DD'))),
              'experience', '[]'::jsonb, 'form12b', '[]'::jsonb,
              'bankProof', jsonb_build_array(jsonb_build_object('name', 'cheque.pdf', 'size', 90000, 'type', 'application/pdf', 'uploadedOn', to_char(current_date - 4, 'YYYY-MM-DD'))))
            else '{}'::jsonb end
        ) as rec
      from tmp_new_emps n
    ) y), '[]'::jsonb)
)
on conflict (key) do update set value = excluded.value, updated_at = now();

-- ============ 10. CAB: vehicles, drivers, trips, assignments ============
insert into app_store (key, value) values
('hr_vehicles', '[{"id":"VEH01","number":"DL 01 AB 1234","label":"Sedan / White"},{"id":"VEH02","number":"HR 26 CD 5678","label":"SUV / Silver"},{"id":"VEH03","number":"DL 03 EF 3456","label":"Sedan / Black"},{"id":"VEH04","number":"HR 27 GH 7890","label":"SUV / Grey"},{"id":"VEH05","number":"DL 05 IJ 2468","label":"Tempo / 12 seater"},{"id":"VEH06","number":"HR 29 KL 1357","label":"Sedan / Blue"}]'::jsonb),
('hr_drivers', '[{"id":"DRV01","name":"Ramesh Kumar","mobile":"9811012345","pin":"1234"},{"id":"DRV02","name":"Suresh Yadav","mobile":"9822067890","pin":"5678"},{"id":"DRV03","name":"Mohan Lal","mobile":"9833011223","pin":"9012"},{"id":"DRV04","name":"Dinesh Pal","mobile":"9844022334","pin":"3456"},{"id":"DRV05","name":"Harish Chandra","mobile":"9855033445","pin":"7890"},{"id":"DRV06","name":"Balwant Singh","mobile":"9866044556","pin":"2345"}]'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();

-- Trips: every driver runs 3 pickups and 3 drops in a day (morning,
-- midday and night rounds) = 36 trips, each driver on their own vehicle.
-- Trips per driver: TRP(6d-5)..TRP(6d) as pickup/drop pairs; cab times are
-- staggered by 10 minutes per driver so sorting shows realistic variety.
insert into app_store (key, value)
select 'hr_trips', coalesce(jsonb_agg(rec order by t), '[]'::jsonb)
from (
  select t, (
    jsonb_build_object(
      'id', 'TRP' || lpad(t::text, 2, '0'),
      'vehicleId', 'VEH' || lpad(((t - 1) / 6 + 1)::text, 2, '0'),
      'driverId', 'DRV' || lpad(((t - 1) / 6 + 1)::text, 2, '0'),
      'direction', case when mod(t - 1, 2) = 0 then 'pickup' else 'drop' end,
      'time', to_char(make_interval(mins =>
        (case when mod(t - 1, 2) = 0
              then (array[450, 525, 840])[mod(t - 1, 6) / 2 + 1]
              else (array[1110, 1155, 1380])[mod(t - 1, 6) / 2 + 1] end)
        + ((t - 1) / 6) * 10), 'HH24:MI')
    )
    || case when mod(t - 1, 2) = 0 then jsonb_build_object(
         'shiftStart', to_char(make_interval(mins => (array[540, 600, 930])[mod(t - 1, 6) / 2 + 1]), 'HH24:MI'),
         'officeGate', '')
       else jsonb_build_object(
         'shiftEnd', to_char(make_interval(mins => (array[1080, 1125, 1350])[mod(t - 1, 6) / 2 + 1]), 'HH24:MI'),
         'officeGate', 'Gate ' || (mod(t, 6) + 1))
       end
    || jsonb_build_object(
      'supervisorName', (array['Anil Singh','Meena Joshi','Rakesh Arora'])[mod(t - 1, 6) / 2 + 1],
      'supervisorMobile', (array['9810055555','9822077777','9833088888'])[mod(t - 1, 6) / 2 + 1])
  ) as rec
  from generate_series(1, 36) t
) x
on conflict (key) do update set value = excluded.value, updated_at = now();

insert into app_store (key, value)
select 'hr_cab_assignments', coalesce(jsonb_agg(rec order by id), '[]'::jsonb)
from (
  select p.id, jsonb_build_object(
    'employeeId', p.id,
    'pickupTripId', (array['TRP01','TRP03','TRP05','TRP07','TRP09','TRP11','TRP13','TRP15','TRP17','TRP19','TRP21','TRP23','TRP25','TRP27','TRP29','TRP31','TRP33','TRP35'])[mod(p.i, 18) + 1],
    'dropTripId', (array['TRP02','TRP04','TRP06','TRP08','TRP10','TRP12','TRP14','TRP16','TRP18','TRP20','TRP22','TRP24','TRP26','TRP28','TRP30','TRP32','TRP34','TRP36'])[mod(p.i, 18) + 1]
  ) as rec
  from tmp_people p where p.wants_cab and p.id like 'EMP%'
) x
on conflict (key) do update set value = excluded.value, updated_at = now();

-- ============ 11. CAB REQUESTS + MESSAGES (scale with people) ============
insert into app_store (key, value)
select 'hr_cab_requests', coalesce(jsonb_agg(rec order by id), '[]'::jsonb)
from (
  select p.id, jsonb_build_object(
    'id', 'CABREQ' || lpad(p.i::text, 3, '0'),
    'employeeId', p.id,
    'forDates', jsonb_build_array(to_char(current_date + 1, 'YYYY-MM-DD')),
    'newLocation', 'Temporary address ' || p.i || ', Sector ' || (10 + mod(p.i, 50)),
    'newGate', 'Gate ' || (mod(p.i, 6) + 1),
    'newTime', '0' || (7 + mod(p.i, 2)) || ':' || lpad(mod(p.i*7, 50)::text, 2, '0'),
    'reason', 'Staying at a relative place for a couple of days.',
    'status', (array['pending','approved','rejected'])[mod(p.i, 3) + 1],
    'adminNote', case when mod(p.i, 3) = 2 then 'Not possible on that route, sorry.' else '' end,
    'raisedOn', to_char(current_date - mod(p.i, 4), 'YYYY-MM-DD')
  ) as rec
  from tmp_people p where p.id like 'EMP%' and mod(p.i, 3) <> 1
) x
on conflict (key) do update set value = excluded.value, updated_at = now();

insert into app_store (key, value)
select 'hr_cab_messages', coalesce(jsonb_agg(rec order by id, k), '[]'::jsonb)
from (
  select p.id, k, jsonb_build_object(
    'id', 'CABMSG' || lpad(p.i::text, 3, '0') || k,
    'employeeId', p.id,
    'byRole', (array['employee','admin'])[mod(k, 2) + 1],
    'text', (array['Where is my cab? It is usually here by now.','Driver is 5 minutes away, sorry for the wait.','Cab reached, coming down.','Please wait 2 minutes at the gate.'])[mod(k, 4) + 1],
    'on', to_char(now() - (k * interval '30 minutes'), 'YYYY-MM-DD"T"HH24:MI:SS'),
    'readByAdmin', k < 3
  ) as rec
  from tmp_people p cross join generate_series(1, 4) k
  where p.id like 'EMP%' and mod(p.i, 4) = 0
) x
on conflict (key) do update set value = excluded.value, updated_at = now();

-- IT staff roster (used by the IT help desk assign dropdown) and an empty
-- cab-cancellations list so both features work right after the load.
insert into app_store (key, value) values
('hr_it_staff', '[{"id":"IT001","name":"Rajesh Kumar","mobile":"9876543210","email":"rajesh.kumar@company.com"},{"id":"IT002","name":"Anita Desai","mobile":"9876543211","email":"anita.desai@company.com"},{"id":"IT003","name":"Vikram Singh","mobile":"9876543212","email":"vikram.singh@company.com"}]'::jsonb),
('hr_cab_cancellations', '[]'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();

-- ============ 12. ANNOUNCEMENTS (36) + read maps ============
insert into app_store (key, value)
select 'hr_announcements', coalesce(jsonb_agg(jsonb_build_object(
    'id', 'ANN' || lpad(k::text, 2, '0'),
    'title', (array['Office closure notice','Updated WFH policy','Internal job posting','Annual sports day','Server maintenance tonight','Quarterly townhall','Health checkup camp','New cafeteria menu','Festival celebration','Safety week','Training session','Team outing photos'])[mod(k - 1, 12) + 1],
    'content', 'Generated announcement body text number ' || k || '. It is long enough to test the read-more behaviour of the announcements screen in the application.',
    'type', (array['general','policy','job','event','urgent'])[mod(k, 5) + 1],
    'createdBy', case when mod(k, 5) = 4 then 'IT001' else 'ADM001' end,
    'createdOn', to_char(current_date - mod(k*3, 20), 'YYYY-MM-DD'),
    'excludedEmployees', case when mod(k, 6) = 0 then jsonb_build_array('IT003') else '[]'::jsonb end
  ) order by k), '[]'::jsonb)
from generate_series(1, 36) k
on conflict (key) do update set value = excluded.value, updated_at = now();

insert into app_store (key, value) values
('hr_read_announcements', '{}'::jsonb),
('hr_notification_reads', '{}'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();

commit;

-- Done. Refresh the web app; it will load this data from Supabase.
