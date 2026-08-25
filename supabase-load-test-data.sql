-- WorkBuddy EMS — heavy load test data (500 employees, unique names)
-- Paste into Supabase SQL Editor and press Run. Safe to run again (idempotent).
-- It REPLACES the current data with a large generated dataset covering every
-- case the app handles. Logins still work: EMP001/1111, ADM001/0000,
-- IT001/5555, DRV01/1234. New employees use PIN 1234.
-- 14 base + 486 generated = 500 people, every name unique.

begin;

-- ============ 1. EMPLOYEES (14 base + 486 generated = 500, unique names) ============
-- Names are indexed pairs of 23 first × 23 last names: fi = i % 23, li = (i / 23) % 23,
-- so for i in 1..486 every (first, last) combination is distinct — no two
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
  i in (11,21,31,41,51,61,71,81,91,101) as is_manager,
  case when i in (11,21,31,41,51,61,71,81,91,101) then null
       else (array['EMP001','EMP006','EMP021','EMP031','EMP041','EMP051','EMP061','EMP071','EMP081','EMP091'])[mod(i,10)+1] end as manager_id,
  to_char(current_date - (45 + mod(i*37, 900)), 'YYYY-MM-DD') as date_joined,
  12000 + mod(i*13, 30)*1000 as basic,
  mod(i,5) <> 0 as wants_cab,
  case mod(i, 4)
    when 0 then 'SHIFT_MORNING'
    when 1 then 'SHIFT_AFTERNOON'
    when 2 then 'SHIFT_EVENING'
    else 'SHIFT_NIGHT'
  end as shift_id
from generate_series(1, 486) i;

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
        'shiftId', shift_id,
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

-- ============ 2. ATTENDANCE (~75,000 rows, 600 days × 137 people) ============
insert into app_store (key, value)
select 'hr_attendance', coalesce(jsonb_agg(rec order by emp_id, day), '[]'::jsonb)
from (
  -- Base attendance: all employees, last 200 days
  select
    p.id as emp_id, d.day,
    jsonb_build_object(
      'id', 'ATT' || lpad(row_number() over (order by p.id, d.day)::text, 6, '0'),
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
    from generate_series(current_date - 600, current_date, interval '1 day') gs
    where extract(dow from gs) between 1 and 5
  ) d
  where mod(p.i*31 + d.di*17, 100) > 7
  -- Skip attendance for employees who are on approved leave that day
  -- (same deterministic formula as section 3b: 12 employees per weekday)
  and not exists (
    select 1 from generate_series(0, 11) s
    where p.id = 'EMP' || lpad((10 + mod(d.di * 12 + s * 11, 123) + 1)::text, 3, '0')
  )
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

-- ============ 3b. ADDITIONAL APPROVED LEAVES (~12 employees on leave per weekday) ============
-- Ensures ~10-15 employees are on approved leave every weekday for dashboard testing.
-- Uses deterministic formula: employee index = (day_offset * 12 + slot * 11) % 123 + 1
-- Since gcd(11, 123) = 1, each day gets 12 distinct employees from EMP011..EMP133.
insert into app_store (key, value)
select 'hr_leaves', (
  select value from app_store where key = 'hr_leaves'
) || (
  select coalesce(jsonb_agg(rec order by rn), '[]'::jsonb)
  from (
    select row_number() over () as rn,
      jsonb_build_object(
        'id', 'LVX' || lpad(row_number() over (order by d.day, s)::text, 5, '0'),
        'employeeId', 'EMP' || lpad((10 + mod(d.di * 12 + s * 11, 123) + 1)::text, 3, '0'),
        'type', (array['casual','sick','earned','halfday','short','unpaid'])[mod(d.di + s, 6) + 1],
        'fromDate', to_char(d.day, 'YYYY-MM-DD'),
        'toDate', to_char(d.day, 'YYYY-MM-DD'),
        'reason', (array['Personal work','Family function','Medical appointment','Out of station','Festival','Bank work'])[mod(d.di + s, 6) + 1],
        'status', 'approved',
        'stage', null,
        'appliedOn', to_char(d.day - 3, 'YYYY-MM-DD'),
        'decidedBy', 'ADM001',
        'decidedOn', to_char(d.day - 2, 'YYYY-MM-DD'),
        'messages', '[]'::jsonb,
        'rejectionReason', ''
      ) as rec
    from (
      select gs::date as day, row_number() over (order by gs)::int as di
      from generate_series(current_date - 600, current_date, interval '1 day') gs
      where extract(dow from gs) between 1 and 5
    ) d
    cross join generate_series(0, 11) s
  ) sub
)
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

-- IT staff roster (used by the IT help desk assign dropdown).
insert into app_store (key, value) values
('hr_it_staff', '[{"id":"IT001","name":"Rajesh Kumar","mobile":"9876543210","email":"rajesh.kumar@company.com"},{"id":"IT002","name":"Anita Desai","mobile":"9876543211","email":"anita.desai@company.com"},{"id":"IT003","name":"Vikram Singh","mobile":"9876543212","email":"vikram.singh@company.com"}]'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();

-- Cab cancellations: generate sample data for August and September 2026.
-- Mix of skip-pickup-only, skip-drop-only, and skip-both for various employees.
insert into app_store (key, value)
select 'hr_cab_cancellations', coalesce(jsonb_agg(rec), '[]'::jsonb)
from (
  select jsonb_build_object(
    'employeeId', emp_id,
    'date', dt::text,
    'skipPickup', skip_p,
    'skipDrop', skip_d
  ) as rec
  from (
    -- August 2026: various employees cancel on different days
    select 'EMP002' as emp_id, '2026-08-01'::date as dt, true as skip_p, false as skip_d union all
    select 'EMP003', '2026-08-01', false, true union all
    select 'EMP004', '2026-08-04', true, true union all
    select 'EMP005', '2026-08-05', true, false union all
    select 'EMP007', '2026-08-06', false, true union all
    select 'EMP008', '2026-08-07', true, true union all
    select 'EMP009', '2026-08-08', true, false union all
    select 'EMP010', '2026-08-11', false, true union all
    select 'EMP002', '2026-08-12', true, true union all
    select 'EMP003', '2026-08-13', true, false union all
    select 'EMP004', '2026-08-14', false, true union all
    select 'EMP005', '2026-08-15', true, false union all
    select 'EMP007', '2026-08-18', true, true union all
    select 'EMP008', '2026-08-19', false, true union all
    select 'EMP009', '2026-08-20', true, false union all
    select 'EMP010', '2026-08-21', true, true union all
    select 'EMP002', '2026-08-22', false, true union all
    select 'EMP002', '2026-08-24', true, false union all
    select 'EMP003', '2026-08-25', true, false union all
    select 'EMP004', '2026-08-26', true, true union all
    select 'EMP005', '2026-08-27', false, true union all
    select 'EMP007', '2026-08-28', true, false union all
    select 'EMP008', '2026-08-29', true, true union all
    -- September 2026: similar pattern
    select 'EMP002', '2026-09-01', true, false union all
    select 'EMP003', '2026-09-02', false, true union all
    select 'EMP004', '2026-09-03', true, true union all
    select 'EMP005', '2026-09-04', true, false union all
    select 'EMP007', '2026-09-05', false, true union all
    select 'EMP008', '2026-09-08', true, true union all
    select 'EMP009', '2026-09-09', true, false union all
    select 'EMP010', '2026-09-10', false, true union all
    select 'EMP002', '2026-09-11', true, true union all
    select 'EMP003', '2026-09-12', true, false union all
    select 'EMP004', '2026-09-15', false, true union all
    select 'EMP005', '2026-09-16', true, false union all
    select 'EMP007', '2026-09-17', true, true union all
    select 'EMP008', '2026-09-18', false, true union all
    select 'EMP009', '2026-09-19', true, false union all
    select 'EMP010', '2026-09-22', true, true union all
    select 'EMP002', '2026-09-23', false, true union all
    select 'EMP003', '2026-09-24', true, false union all
    select 'EMP004', '2026-09-25', true, true union all
    select 'EMP005', '2026-09-26', false, true union all
    select 'EMP007', '2026-09-29', true, false union all
    select 'EMP008', '2026-09-30', true, true
  ) cancels
) sub
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

-- ============ 13. COMPREHENSIVE TEST DATA FOR EMP001 & EMP002 ============
-- Appends records that cover every possible case in every feature/dropdown.
-- Uses tmp_people (still available from section 1 within this transaction).

-- ---- 13a. LEAVES: every type × status × stage for EMP001 & EMP002 ----
update app_store
set value = (
  coalesce((select value from app_store where key = 'hr_leaves'), '[]'::jsonb)
  || (
    -- EMP001 (i=1, manager, managerId=null)
    select coalesce(jsonb_agg(rec), '[]'::jsonb) from (values
      (1, jsonb_build_object('id','LVX001','employeeId','EMP001','type','casual','fromDate','2026-09-01','toDate','2026-09-01','reason','Personal work','status','pending','stage','manager','appliedOn','2026-08-22','decidedBy',null,'decidedOn',null,'rejectionReason','','messages','[]'::jsonb)),
      (2, jsonb_build_object('id','LVX002','employeeId','EMP001','type','sick','fromDate','2026-08-10','toDate','2026-08-11','reason','Fever and cold','status','approved','stage',null,'appliedOn','2026-08-09','decidedBy','ADM001','decidedOn','2026-08-10','rejectionReason','','messages','[]'::jsonb)),
      (3, jsonb_build_object('id','LVX003','employeeId','EMP001','type','earned','fromDate','2026-12-25','toDate','2026-12-31','reason','Year-end vacation','status','approved','stage',null,'appliedOn','2026-08-01','decidedBy','ADM001','decidedOn','2026-08-02','rejectionReason','','messages','[]'::jsonb)),
      (4, jsonb_build_object('id','LVX004','employeeId','EMP001','type','halfday','halfDayPart','first','fromDate','2026-08-20','toDate','2026-08-20','reason','Bank work in morning','status','approved','stage',null,'appliedOn','2026-08-18','decidedBy','ADM001','decidedOn','2026-08-18','rejectionReason','','messages','[]'::jsonb)),
      (5, jsonb_build_object('id','LVX005','employeeId','EMP001','type','halfday','halfDayPart','second','fromDate','2026-08-22','toDate','2026-08-22','reason','Family dinner','status','pending','stage','hr','appliedOn','2026-08-20','decidedBy',null,'decidedOn',null,'rejectionReason','','messages','[]'::jsonb)),
      (6, jsonb_build_object('id','LVX006','employeeId','EMP001','type','short','fromDate','2026-08-15','toDate','2026-08-15','reason','Doctor appointment','status','approved','stage',null,'appliedOn','2026-08-14','decidedBy','ADM001','decidedOn','2026-08-14','rejectionReason','','messages','[]'::jsonb)),
      (7, jsonb_build_object('id','LVX007','employeeId','EMP001','type','unpaid','fromDate','2026-07-10','toDate','2026-07-12','reason','Personal emergency','status','approved','stage',null,'appliedOn','2026-07-08','decidedBy','ADM001','decidedOn','2026-07-09','rejectionReason','','messages','[]'::jsonb)),
      (8, jsonb_build_object('id','LVX008','employeeId','EMP001','type','casual','fromDate','2026-10-05','toDate','2026-10-05','reason','Friend wedding','status','rejected','stage',null,'appliedOn','2026-09-28','decidedBy','ADM001','decidedOn','2026-09-29','rejectionReason','Team has a critical deadline that week. Please reschedule.','messages','[]'::jsonb)),
      (9, jsonb_build_object('id','LVX009','employeeId','EMP001','type','sick','fromDate','2026-06-15','toDate','2026-06-15','reason','Migraine','status','withdrawn','stage',null,'appliedOn','2026-06-14','decidedBy',null,'decidedOn',null,'rejectionReason','','withdrawnOn','2026-06-15','messages','[]'::jsonb)),
      (10, jsonb_build_object('id','LVX010','employeeId','EMP001','type','earned','fromDate','2026-11-01','toDate','2026-11-05','reason','Diwali vacation','status','pending','stage','hr','appliedOn','2026-08-20','managerStatus','approved','managerDecidedBy','EMP001','managerDecidedOn','2026-08-21','decidedBy',null,'decidedOn',null,'rejectionReason','','messages','[]'::jsonb)),
      -- EMP002 (i=2, reports to EMP001)
      (11, jsonb_build_object('id','LVX011','employeeId','EMP002','type','casual','fromDate','2026-09-10','toDate','2026-09-10','reason','Personal errand','status','pending','stage','manager','appliedOn','2026-08-23','decidedBy',null,'decidedOn',null,'rejectionReason','','messages','[]'::jsonb)),
      (12, jsonb_build_object('id','LVX012','employeeId','EMP002','type','sick','fromDate','2026-08-05','toDate','2026-08-06','reason','Food poisoning','status','approved','stage',null,'appliedOn','2026-08-05','decidedBy','ADM001','decidedOn','2026-08-06','rejectionReason','','supportingDocuments',jsonb_build_array(jsonb_build_object('name','medical-cert.pdf','size',85000,'type','application/pdf','uploadedOn','2026-08-05')),'messages','[]'::jsonb)),
      (13, jsonb_build_object('id','LVX013','employeeId','EMP002','type','earned','fromDate','2026-10-15','toDate','2026-10-20','reason','Holiday trip','status','approved','stage',null,'appliedOn','2026-08-01','decidedBy','ADM001','decidedOn','2026-08-02','rejectionReason','','messages','[]'::jsonb)),
      (14, jsonb_build_object('id','LVX014','employeeId','EMP002','type','halfday','halfDayPart','first','fromDate','2026-08-25','toDate','2026-08-25','reason','Dentist appointment','status','pending','stage','manager','appliedOn','2026-08-22','decidedBy',null,'decidedOn',null,'rejectionReason','','messages','[]'::jsonb)),
      (15, jsonb_build_object('id','LVX015','employeeId','EMP002','type','halfday','halfDayPart','second','fromDate','2026-08-18','toDate','2026-08-18','reason','College seminar','status','approved','stage',null,'appliedOn','2026-08-15','decidedBy','EMP001','decidedOn','2026-08-16','rejectionReason','','messages','[]'::jsonb)),
      (16, jsonb_build_object('id','LVX016','employeeId','EMP002','type','short','fromDate','2026-08-20','toDate','2026-08-20','reason','Passport renewal','status','approved','stage',null,'appliedOn','2026-08-18','decidedBy','EMP001','decidedOn','2026-08-19','rejectionReason','','messages','[]'::jsonb)),
      (17, jsonb_build_object('id','LVX017','employeeId','EMP002','type','unpaid','fromDate','2026-07-20','toDate','2026-07-22','reason','Moving to new apartment','status','approved','stage',null,'appliedOn','2026-07-15','decidedBy','ADM001','decidedOn','2026-07-16','rejectionReason','','messages','[]'::jsonb)),
      (18, jsonb_build_object('id','LVX018','employeeId','EMP002','type','casual','fromDate','2026-09-25','toDate','2026-09-25','reason','Sibling function','status','rejected','stage',null,'appliedOn','2026-09-18','decidedBy','EMP001','decidedOn','2026-09-19','rejectionReason','Sprint review scheduled that day.','messages','[]'::jsonb)),
      (19, jsonb_build_object('id','LVX019','employeeId','EMP002','type','sick','fromDate','2026-06-10','toDate','2026-06-11','reason','Flu','status','withdrawn','stage',null,'appliedOn','2026-06-09','decidedBy',null,'decidedOn',null,'rejectionReason','','withdrawnOn','2026-06-10','messages','[]'::jsonb)),
      (20, jsonb_build_object('id','LVX020','employeeId','EMP002','type','earned','fromDate','2026-11-10','toDate','2026-11-14','reason','Thanksgiving travel','status','pending','stage','hr','appliedOn','2026-08-20','managerStatus','approved','managerDecidedBy','EMP001','managerDecidedOn','2026-08-21','decidedBy',null,'decidedOn',null,'rejectionReason','','messages','[]'::jsonb))
    ) AS t(rn, rec)
  )
)
where key = 'hr_leaves';

-- ---- 13b. TASKS: every priority × status for EMP001 & EMP002 ----
update app_store
set value = (
  coalesce((select value from app_store where key = 'hr_tasks'), '[]'::jsonb)
  || (
    select coalesce(jsonb_agg(rec), '[]'::jsonb) from (values
      -- EMP001 tasks (manager, self-assigned and assigned by system)
      (1, jsonb_build_object('id','TSKX001','title','Review Q3 sales report','description','Go through the quarterly sales numbers and prepare summary.','assigneeId','EMP001','createdById','EMP001','dueDate','2026-08-28','priority','high','status','todo','createdOn','2026-08-20','completedOn',null,'closedBy',null,'closedOn',null,'messages','[]'::jsonb)),
      (2, jsonb_build_object('id','TSKX002','title','Update team attendance policy','description','Draft updated policy for hybrid work model.','assigneeId','EMP001','createdById','ADM001','dueDate','2026-09-05','priority','medium','status','inprogress','createdOn','2026-08-15','completedOn',null,'closedBy',null,'closedOn',null,'messages',jsonb_build_array(jsonb_build_object('id','TSMX001','byId','ADM001','text','Please prioritise this before the review meeting.','on','2026-08-16')))),
      (3, jsonb_build_object('id','TSKX003','title','Submit monthly expense sheet','description','Compile and submit all team expenses for August.','assigneeId','EMP001','createdById','EMP001','dueDate','2026-08-15','priority','low','status','done','createdOn','2026-08-01','completedOn','2026-08-14','closedBy',null,'closedOn',null,'messages','[]'::jsonb)),
      (4, jsonb_build_object('id','TSKX004','title','Close Q2 support tickets','description','Review and close all resolved support tickets from Q2.','assigneeId','EMP001','createdById','EMP001','dueDate','2026-07-31','priority','high','status','closed','createdOn','2026-07-15','completedOn','2026-07-28','closedBy','EMP001','closedOn','2026-07-30','messages','[]'::jsonb)),
      (5, jsonb_build_object('id','TSKX005','title','Prepare onboarding checklist','description','New hire joining next week. Prepare all documents.','assigneeId','EMP001','createdById','ADM001','dueDate','2026-08-10','priority','high','status','todo','createdOn','2026-08-05','completedOn',null,'closedBy',null,'closedOn',null,'messages','[]'::jsonb)),
      (6, jsonb_build_object('id','TSKX006','title','Organise team lunch','description','Book restaurant for team celebration.','assigneeId','EMP001','createdById','EMP001','dueDate','2026-09-15','priority','low','status','inprogress','createdOn','2026-08-18','completedOn',null,'closedBy',null,'closedOn',null,'messages','[]'::jsonb)),
      (7, jsonb_build_object('id','TSKX007','title','Update CRM data','description','Clean up duplicate entries in CRM.','assigneeId','EMP001','createdById','EMP001','dueDate','2026-07-20','priority','medium','status','done','createdOn','2026-07-10','completedOn','2026-07-18','closedBy',null,'closedOn',null,'messages','[]'::jsonb)),
      (8, jsonb_build_object('id','TSKX008','title','Archive old project files','description','Move completed project files to archive.','assigneeId','EMP001','createdById','ADM001','dueDate','2026-08-01','priority','low','status','closed','createdOn','2026-07-20','completedOn','2026-07-30','closedBy','ADM001','closedOn','2026-08-01','messages','[]'::jsonb)),
      (9, jsonb_build_object('id','TSKX009','title','Send client proposal','description','Finalise and send the proposal for the new client.','assigneeId','EMP001','createdById','EMP001','dueDate','2026-08-18','priority','high','status','done','createdOn','2026-08-10','completedOn','2026-08-17','closedBy',null,'closedOn',null,'messages',jsonb_build_array(jsonb_build_object('id','TSMX002','byId','EMP001','text','Client confirmed receipt. Good work.','on','2026-08-18')))),
      (10, jsonb_build_object('id','TSKX010','title','Plan sprint retrospective','description','Schedule and prepare retro for current sprint.','assigneeId','EMP001','createdById','EMP001','dueDate','2026-09-01','priority','medium','status','todo','createdOn','2026-08-20','completedOn',null,'closedBy',null,'closedOn',null,'messages','[]'::jsonb)),
      -- EMP002 tasks (assigned by manager EMP001)
      (11, jsonb_build_object('id','TSKX011','title','Create wireframes for dashboard','description','Design low-fi wireframes for the new analytics dashboard.','assigneeId','EMP002','createdById','EMP001','dueDate','2026-08-28','priority','high','status','todo','createdOn','2026-08-20','completedOn',null,'closedBy',null,'closedOn',null,'messages','[]'::jsonb)),
      (12, jsonb_build_object('id','TSKX012','title','Update icon library','description','Replace outdated icons with new Phosphor set.','assigneeId','EMP002','createdById','EMP001','dueDate','2026-09-03','priority','medium','status','inprogress','createdOn','2026-08-18','completedOn',null,'closedBy',null,'closedOn',null,'messages',jsonb_build_array(jsonb_build_object('id','TSMX003','byId','EMP001','text','Please prioritise this before the review meeting.','on','2026-08-19')))),
      (13, jsonb_build_object('id','TSKX013','title','Fix button alignment bug','description','Buttons in the settings modal are misaligned on mobile.','assigneeId','EMP002','createdById','EMP001','dueDate','2026-08-15','priority','high','status','done','createdOn','2026-08-10','completedOn','2026-08-14','closedBy',null,'closedOn',null,'messages','[]'::jsonb)),
      (14, jsonb_build_object('id','TSKX014','title','Redesign login page','description','Complete visual overhaul of the login screen.','assigneeId','EMP002','createdById','EMP001','dueDate','2026-07-31','priority','medium','status','closed','createdOn','2026-07-15','completedOn','2026-07-28','closedBy','EMP001','closedOn','2026-07-30','messages','[]'::jsonb)),
      (15, jsonb_build_object('id','TSKX015','title','Prepare design system tokens','description','Define colour and spacing tokens for the design system.','assigneeId','EMP002','createdById','EMP002','dueDate','2026-08-10','priority','low','status','todo','createdOn','2026-08-01','completedOn',null,'closedBy',null,'closedOn',null,'messages','[]'::jsonb)),
      (16, jsonb_build_object('id','TSKX016','title','Create email templates','description','Design responsive HTML email templates.','assigneeId','EMP002','createdById','EMP001','dueDate','2026-09-10','priority','low','status','inprogress','createdOn','2026-08-20','completedOn',null,'closedBy',null,'closedOn',null,'messages','[]'::jsonb)),
      (17, jsonb_build_object('id','TSKX017','title','Update user profile page','description','Add new fields to the profile view.','assigneeId','EMP002','createdById','EMP001','dueDate','2026-07-25','priority','medium','status','done','createdOn','2026-07-10','completedOn','2026-07-22','closedBy',null,'closedOn',null,'messages','[]'::jsonb)),
      (18, jsonb_build_object('id','TSKX018','title','Audit accessibility issues','description','Run axe audit and fix critical issues.','assigneeId','EMP002','createdById','EMP001','dueDate','2026-08-05','priority','high','status','closed','createdOn','2026-07-20','completedOn','2026-08-03','closedBy','EMP001','closedOn','2026-08-05','messages','[]'::jsonb)),
      (19, jsonb_build_object('id','TSKX019','title','Design notification bell','description','Create UI for the notification dropdown.','assigneeId','EMP002','createdById','EMP002','dueDate','2026-08-22','priority','low','status','done','createdOn','2026-08-12','completedOn','2026-08-21','closedBy',null,'closedOn',null,'messages','[]'::jsonb)),
      (20, jsonb_build_object('id','TSKX020','title','Prototype dark mode','description','Build a quick prototype for dark mode toggle.','assigneeId','EMP002','createdById','EMP001','dueDate','2026-09-20','priority','medium','status','todo','createdOn','2026-08-22','completedOn',null,'closedBy',null,'closedOn',null,'messages','[]'::jsonb))
    ) AS t(rn, rec)
  )
)
where key = 'hr_tasks';

-- ---- 13c. TICKETS: every kind × category × status ----
update app_store
set value = (
  coalesce((select value from app_store where key = 'hr_tickets'), '[]'::jsonb)
  || (
    select coalesce(jsonb_agg(rec), '[]'::jsonb) from (values
      (1, jsonb_build_object('id','TKTX001','kind','query','category','payslip','subject','Doubt about August payslip','status','open','employeeId','EMP001','anonymous',false,'confidential',false,'createdOn','2026-08-20','updatedOn','2026-08-20','messages',jsonb_build_array(jsonb_build_object('id','MSGX001','byId','EMP001','byRole','employee','text','My HRA deduction seems higher than expected.','on','2026-08-20')))),
      (2, jsonb_build_object('id','TKTX002','kind','query','category','leave','subject','Leave balance not matching','status','inprogress','employeeId','EMP001','anonymous',false,'confidential',false,'createdOn','2026-08-15','updatedOn','2026-08-18','messages',jsonb_build_array(jsonb_build_object('id','MSGX002','byId','EMP001','byRole','employee','text','I have 5 earned leaves but system shows 3.','on','2026-08-15'),jsonb_build_object('id','MSGX003','byId','ADM001','byRole','admin','text','Looking into this. Will update shortly.','on','2026-08-18')))),
      (3, jsonb_build_object('id','TKTX003','kind','query','category','pfuan','subject','PF passbook download issue','status','resolved','employeeId','EMP001','anonymous',false,'confidential',false,'createdOn','2026-07-10','updatedOn','2026-07-15','messages',jsonb_build_array(jsonb_build_object('id','MSGX004','byId','EMP001','byRole','employee','text','Cannot download PF passbook from portal.','on','2026-07-10'),jsonb_build_object('id','MSGX005','byId','ADM001','byRole','admin','text','Fixed. Please try again.','on','2026-07-15')))),
      (4, jsonb_build_object('id','TKTX004','kind','query','category','form16','subject','Form 16 request for FY 2025-26','status','closed','employeeId','EMP001','anonymous',false,'confidential',false,'createdOn','2026-06-01','updatedOn','2026-06-10','messages',jsonb_build_array(jsonb_build_object('id','MSGX006','byId','EMP001','byRole','employee','text','Please issue my Form 16.','on','2026-06-01')))),
      (5, jsonb_build_object('id','TKTX005','kind','query','category','policy','subject','WFH policy clarification','status','open','employeeId','EMP001','anonymous',false,'confidential',false,'createdOn','2026-08-22','updatedOn','2026-08-22','messages',jsonb_build_array(jsonb_build_object('id','MSGX007','byId','EMP001','byRole','employee','text','How many WFH days are allowed per month?','on','2026-08-22')))),
      (6, jsonb_build_object('id','TKTX006','kind','query','category','itasset','subject','Second monitor request','status','withdrawn','employeeId','EMP001','anonymous',false,'confidential',false,'createdOn','2026-07-20','updatedOn','2026-07-25','messages',jsonb_build_array(jsonb_build_object('id','MSGX008','byId','EMP001','byRole','employee','text','Requesting a second monitor for my desk.','on','2026-07-20')))),
      (7, jsonb_build_object('id','TKTX007','kind','grievance','category','compensation','subject','Salary discrepancy','status','inprogress','employeeId','EMP001','anonymous',false,'confidential',true,'createdOn','2026-08-10','updatedOn','2026-08-15','messages',jsonb_build_array(jsonb_build_object('id','MSGX009','byId','EMP001','byRole','employee','text','My last increment was not reflected correctly.','on','2026-08-10')))),
      (8, jsonb_build_object('id','TKTX008','kind','grievance','category','posh','subject','Workplace harassment complaint','status','open','employeeId','EMP001','anonymous',true,'confidential',true,'createdOn','2026-08-18','updatedOn','2026-08-18','messages',jsonb_build_array(jsonb_build_object('id','MSGX010','byId','EMP001','byRole','employee','text','I wish to report an incident confidentially.','on','2026-08-18')))),
      -- EMP002 tickets
      (9, jsonb_build_object('id','TKTX009','kind','query','category','payslip','subject','TDS deduction query','status','open','employeeId','EMP002','anonymous',false,'confidential',false,'createdOn','2026-08-21','updatedOn','2026-08-21','messages',jsonb_build_array(jsonb_build_object('id','MSGX011','byId','EMP002','byRole','employee','text','Why is TDS deducted when my CTC is below the threshold?','on','2026-08-21')))),
      (10, jsonb_build_object('id','TKTX010','kind','query','category','leave','subject','Earned leave carry-forward','status','resolved','employeeId','EMP002','anonymous',false,'confidential',false,'createdOn','2026-07-05','updatedOn','2026-07-12','messages',jsonb_build_array(jsonb_build_object('id','MSGX012','byId','EMP002','byRole','employee','text','Can I carry forward unused earned leaves?','on','2026-07-05'),jsonb_build_object('id','MSGX013','byId','ADM001','byRole','admin','text','Yes, up to 15 days can be carried forward.','on','2026-07-12')))),
      (11, jsonb_build_object('id','TKTX011','kind','query','category','form16','subject','Incorrect PAN in records','status','closed','employeeId','EMP002','anonymous',false,'confidential',false,'createdOn','2026-06-15','updatedOn','2026-06-20','messages',jsonb_build_array(jsonb_build_object('id','MSGX014','byId','EMP002','byRole','employee','text','My PAN number is incorrectly recorded.','on','2026-06-15')))),
      (12, jsonb_build_object('id','TKTX012','kind','query','category','policy','subject','Maternity leave policy query','status','inprogress','employeeId','EMP002','anonymous',false,'confidential',false,'createdOn','2026-08-18','updatedOn','2026-08-20','messages',jsonb_build_array(jsonb_build_object('id','MSGX015','byId','EMP002','byRole','employee','text','What is the maternity leave duration and eligibility?','on','2026-08-18')))),
      (13, jsonb_build_object('id','TKTX013','kind','grievance','category','against_person','subject','Unprofessional behaviour by colleague','status','open','employeeId','EMP002','anonymous',false,'confidential',true,'createdOn','2026-08-19','updatedOn','2026-08-19','messages',jsonb_build_array(jsonb_build_object('id','MSGX016','byId','EMP002','byRole','employee','text','I would like to report inappropriate behaviour.','on','2026-08-19')))),
      (14, jsonb_build_object('id','TKTX014','kind','grievance','category','disciplinary','subject','Policy violation concern','status','closed','employeeId','EMP002','anonymous',false,'confidential',true,'createdOn','2026-05-10','updatedOn','2026-05-20','messages',jsonb_build_array(jsonb_build_object('id','MSGX017','byId','EMP002','byRole','employee','text','I have concerns about a policy violation in my team.','on','2026-05-10'))))
    ) AS t(rn, rec)
  )
)
where key = 'hr_tickets';

-- ---- 13d. IT ISSUES: every category × priority × status ----
update app_store
set value = (
  coalesce((select value from app_store where key = 'hr_it_issues'), '[]'::jsonb)
  || (
    select coalesce(jsonb_agg(rec), '[]'::jsonb) from (values
      (1, jsonb_build_object('id','ITIX001','employeeId','EMP001','issue','Laptop not starting','description','Laptop shows black screen on pressing power button.','category','hardware','priority','high','status','open','assignedTo','IT001','estimatedTime','1 hour','attachment',null,'comments','[]'::jsonb,'createdOn','2026-08-22','updatedOn','2026-08-22')),
      (2, jsonb_build_object('id','ITIX002','employeeId','EMP001','issue','Internet slow','description','Network speed has been very slow since morning.','category','network','priority','medium','status','inprogress','assignedTo','IT002','estimatedTime','30 minutes','attachment',null,'comments',jsonb_build_array(jsonb_build_object('id','ITICX001','byId','IT002','byName','Anita Desai','byRole','it','text','Checking the switch port. Will update.','on','2026-08-22')),'createdOn','2026-08-20','updatedOn','2026-08-22')),
      (3, jsonb_build_object('id','ITIX003','employeeId','EMP001','issue','Software licence error','description','Adobe Creative Suite showing licence expired.','category','software','priority','low','status','resolved','assignedTo','IT001','estimatedTime','2 hours','attachment',null,'comments',jsonb_build_array(jsonb_build_object('id','ITICX002','byId','IT001','byName','Rajesh Kumar','byRole','it','text','Licence renewed. Please restart the app.','on','2026-08-15')),'createdOn','2026-08-10','updatedOn','2026-08-15')),
      (4, jsonb_build_object('id','ITIX004','employeeId','EMP001','issue','Email login failing','description','Cannot log into Outlook. Keeps showing authentication error.','category','email','priority','high','status','closed','assignedTo','IT003','estimatedTime','30 minutes','attachment',null,'comments',jsonb_build_array(jsonb_build_object('id','ITICX003','byId','IT003','byName','Vikram Singh','byRole','it','text','Password was reset. Please check.','on','2026-07-20')),'createdOn','2026-07-18','updatedOn','2026-07-20')),
      (5, jsonb_build_object('id','ITIX005','employeeId','EMP001','issue','Printer not working','description','Floor 2 printer showing paper jam error.','category','hardware','priority','low','status','withdrawn','assignedTo',null,'estimatedTime',null,'attachment',null,'comments','[]'::jsonb,'createdOn','2026-08-05','updatedOn','2026-08-06')),
      (6, jsonb_build_object('id','ITIX006','employeeId','EMP001','issue','VPN disconnects','description','VPN drops every 10 minutes when connected to corporate network.','category','network','priority','high','status','inprogress','assignedTo','IT001','estimatedTime','4 hours','attachment',null,'comments','[]'::jsonb,'createdOn','2026-08-23','updatedOn','2026-08-23')),
      -- EMP002 IT issues
      (7, jsonb_build_object('id','ITIX007','employeeId','EMP002','issue','Monitor flickering','description','External monitor flickers intermittently.','category','hardware','priority','medium','status','open','assignedTo','IT002','estimatedTime','1 hour','attachment',null,'comments','[]'::jsonb,'createdOn','2026-08-21','updatedOn','2026-08-21')),
      (8, jsonb_build_object('id','ITIX008','employeeId','EMP002','issue','Keyboard sticking','description','Space bar and Enter key are sticking.','category','hardware','priority','low','status','resolved','assignedTo','IT001','estimatedTime','30 minutes','attachment',null,'comments',jsonb_build_array(jsonb_build_object('id','ITICX004','byId','IT001','byName','Rajesh Kumar','byRole','it','text','Replacement keyboard has been ordered.','on','2026-08-10')),'createdOn','2026-08-05','updatedOn','2026-08-10')),
      (9, jsonb_build_object('id','ITIX009','employeeId','EMP002','issue','Software licence error','description','Figma seat licence not active.','category','software','priority','high','status','inprogress','assignedTo','IT003','estimatedTime','2 hours','attachment',null,'comments','[]'::jsonb,'createdOn','2026-08-22','updatedOn','2026-08-23')),
      (10, jsonb_build_object('id','ITIX010','employeeId','EMP002','issue','Email login failing','description','Cannot access webmail from mobile device.','category','email','priority','medium','status','closed','assignedTo','IT002','estimatedTime','1 hour','attachment',null,'comments',jsonb_build_array(jsonb_build_object('id','ITICX005','byId','IT002','byName','Anita Desai','byRole','it','text','Mobile sync was disabled. Re-enabled now.','on','2026-07-25')),'createdOn','2026-07-22','updatedOn','2026-07-25')),
      (11, jsonb_build_object('id','ITIX011','employeeId','EMP002','issue','VPN disconnects','description','VPN works on wired but drops on Wi-Fi.','category','other','priority','medium','status','open','assignedTo','IT001','estimatedTime','4 hours','attachment',null,'comments','[]'::jsonb,'createdOn','2026-08-23','updatedOn','2026-08-23')),
      (12, jsonb_build_object('id','ITIX012','employeeId','EMP002','issue','Internet slow','description','Download speed is below 1 Mbps on floor 3.','category','network','priority','high','status','resolved','assignedTo','IT003','estimatedTime','2 hours','attachment',null,'comments',jsonb_build_array(jsonb_build_object('id','ITICX006','byId','IT003','byName','Vikram Singh','byRole','it','text','ISP ticket raised. Bandwidth restored.','on','2026-08-18')),'createdOn','2026-08-15','updatedOn','2026-08-18'))
    ) AS t(rn, rec)
  )
)
where key = 'hr_it_issues';

-- ---- 13e. REIMBURSEMENTS: every category × status ----
update app_store
set value = (
  coalesce((select value from app_store where key = 'hr_reimbursements'), '[]'::jsonb)
  || (
    select coalesce(jsonb_agg(rec), '[]'::jsonb) from (values
      (1, jsonb_build_object('id','RMBX001','employeeId','EMP001','category','conveyance','expenseDate','2026-08-20','amount',1500,'description','Cab fare for client meeting','status','pending','appliedOn','2026-08-21','decidedBy',null,'decidedOn',null,'paidOn',null,'reviewNote','')),
      (2, jsonb_build_object('id','RMBX002','employeeId','EMP001','category','travel','expenseDate','2026-08-10','amount',8500,'description','Flight tickets for Bangalore client visit','status','approved_unpaid','appliedOn','2026-08-12','decidedBy','ADM001','decidedOn','2026-08-13','paidOn',null,'reviewNote','')),
      (3, jsonb_build_object('id','RMBX003','employeeId','EMP001','category','meals','expenseDate','2026-08-05','amount',800,'description','Team lunch with client','status','paid','appliedOn','2026-08-06','decidedBy','ADM001','decidedOn','2026-08-07','paidOn','2026-08-10','reviewNote','')),
      (4, jsonb_build_object('id','RMBX004','employeeId','EMP001','category','office','expenseDate','2026-07-28','amount',3200,'description','Ergonomic mouse and keyboard set','status','rejected','appliedOn','2026-07-30','decidedBy','ADM001','decidedOn','2026-08-01','paidOn',null,'reviewNote','Please use the office supply request process instead.')),
      (5, jsonb_build_object('id','RMBX005','employeeId','EMP001','category','other','expenseDate','2026-07-15','amount',2000,'description','Courier charges for document dispatch','status','withdrawn','appliedOn','2026-07-16','decidedBy',null,'decidedOn',null,'paidOn',null,'reviewNote','')),
      (6, jsonb_build_object('id','RMBX006','employeeId','EMP001','category','conveyance','expenseDate','2026-09-01','amount',600,'description','Auto fare from metro station to office','status','pending','appliedOn','2026-09-02','decidedBy',null,'decidedOn',null,'paidOn',null,'reviewNote','')),
      -- EMP002 reimbursements
      (7, jsonb_build_object('id','RMBX007','employeeId','EMP002','category','meals','expenseDate','2026-08-22','amount',450,'description','Working lunch during design sprint','status','pending','appliedOn','2026-08-23','decidedBy',null,'decidedOn',null,'paidOn',null,'reviewNote','')),
      (8, jsonb_build_object('id','RMBX008','employeeId','EMP002','category','office','expenseDate','2026-08-15','amount',1200,'description','Printer cartridges for team printer','status','approved_unpaid','appliedOn','2026-08-16','decidedBy','EMP001','decidedOn','2026-08-17','paidOn',null,'reviewNote','')),
      (9, jsonb_build_object('id','RMBX009','employeeId','EMP002','category','travel','expenseDate','2026-08-01','amount',5000,'description','Train ticket for design workshop','status','paid','appliedOn','2026-08-02','decidedBy','EMP001','decidedOn','2026-08-03','paidOn','2026-08-05','reviewNote','')),
      (10, jsonb_build_object('id','RMBX010','employeeId','EMP002','category','conveyance','expenseDate','2026-07-20','amount',350,'description','Cab to client site for wireframe review','status','rejected','appliedOn','2026-07-21','decidedBy','EMP001','decidedOn','2026-07-22','paidOn',null,'reviewNote','Please submit cab receipt with the claim.')),
      (11, jsonb_build_object('id','RMBX011','employeeId','EMP002','category','other','expenseDate','2026-07-10','amount',900,'description','Stationery and art supplies for brainstorming','status','withdrawn','appliedOn','2026-07-11','decidedBy',null,'decidedOn',null,'paidOn',null,'reviewNote','')),
      (12, jsonb_build_object('id','RMBX012','employeeId','EMP002','category','meals','expenseDate','2026-09-05','amount',600,'description','Client dinner during project delivery','status','pending','appliedOn','2026-09-06','decidedBy',null,'decidedOn',null,'paidOn',null,'reviewNote',''))
    ) AS t(rn, rec)
  )
)
where key = 'hr_reimbursements';

-- ---- 13f. ATTENDANCE CORRECTIONS: every issue type × status ----
update app_store
set value = (
  coalesce((select value from app_store where key = 'hr_attendance_corrections'), '[]'::jsonb)
  || (
    select coalesce(jsonb_agg(rec), '[]'::jsonb) from (values
      (1, jsonb_build_object('id','ACRX001','employeeId','EMP001','date','2026-08-20','issueType','missed_time_in','description','Forgot to punch in when arriving at 9 AM.','suggestedTimeIn','09:00','suggestedTimeOut',null,'status','pending','appliedOn','2026-08-21','decidedBy',null,'decidedOn',null,'reviewNote','','messages','[]'::jsonb)),
      (2, jsonb_build_object('id','ACRX002','employeeId','EMP001','date','2026-08-18','issueType','missed_time_out','description','Forgot to punch out at end of day.','suggestedTimeIn',null,'suggestedTimeOut','18:30','status','approved','appliedOn','2026-08-19','decidedBy','ADM001','decidedOn','2026-08-19','reviewNote','Approved. Attendance updated.','messages','[]'::jsonb)),
      (3, jsonb_build_object('id','ACRX003','employeeId','EMP001','date','2026-08-15','issueType','wrong_times','description','Punched in twice by mistake. Times are incorrect.','suggestedTimeIn','09:15','suggestedTimeOut','18:00','status','rejected','appliedOn','2026-08-16','decidedBy','ADM001','decidedOn','2026-08-17','reviewNote','Punch records look correct. No change needed.','messages','[]'::jsonb)),
      (4, jsonb_build_object('id','ACRX004','employeeId','EMP001','date','2026-08-10','issueType','wrong_break','description','Break timer was not stopped. Shows 2 hours instead of 30 min.','suggestedTimeIn',null,'suggestedTimeOut',null,'status','withdrawn','appliedOn','2026-08-11','decidedBy',null,'decidedOn',null,'reviewNote','','messages','[]'::jsonb)),
      (5, jsonb_build_object('id','ACRX005','employeeId','EMP001','date','2026-08-05','issueType','other','description','System was down. Could not punch in or out.','suggestedTimeIn','08:45','suggestedTimeOut','17:30','status','approved','appliedOn','2026-08-06','decidedBy','ADM001','decidedOn','2026-08-06','reviewNote','Verified with IT. Attendance corrected.','messages','[]'::jsonb)),
      -- EMP002 attendance corrections
      (6, jsonb_build_object('id','ACRX006','employeeId','EMP002','date','2026-08-22','issueType','missed_time_in','description','Badge reader was not working. Forgot to manual punch.','suggestedTimeIn','09:30','suggestedTimeOut',null,'status','pending','appliedOn','2026-08-23','decidedBy',null,'decidedOn',null,'reviewNote','','messages','[]'::jsonb)),
      (7, jsonb_build_object('id','ACRX007','employeeId','EMP002','date','2026-08-19','issueType','wrong_times','description','Swiped card at wrong terminal. Times are off by 2 hours.','suggestedTimeIn','10:00','suggestedTimeOut','19:00','status','approved','appliedOn','2026-08-20','decidedBy','EMP001','decidedOn','2026-08-20','reviewNote','Approved. Attendance updated.','messages','[]'::jsonb)),
      (8, jsonb_build_object('id','ACRX008','employeeId','EMP002','date','2026-08-14','issueType','missed_time_out','description','Left early for appointment. Forgot to punch out.','suggestedTimeIn',null,'suggestedTimeOut','16:00','status','rejected','appliedOn','2026-08-15','decidedBy','EMP001','decidedOn','2026-08-16','reviewNote','CCTV confirms you left at 17:45. No correction needed.','messages','[]'::jsonb)),
      (9, jsonb_build_object('id','ACRX009','employeeId','EMP002','date','2026-08-08','issueType','wrong_break','description','Break was auto-logged. Did not take a break that day.','suggestedTimeIn',null,'suggestedTimeOut',null,'status','withdrawn','appliedOn','2026-08-09','decidedBy',null,'decidedOn',null,'reviewNote','','messages','[]'::jsonb)),
      (10, jsonb_build_object('id','ACRX010','employeeId','EMP002','date','2026-08-01','issueType','other','description','Power outage. Entire office attendance system was down.','suggestedTimeIn','09:00','suggestedTimeOut','18:00','status','approved','appliedOn','2026-08-02','decidedBy','EMP001','decidedOn','2026-08-02','reviewNote','Confirmed building-wide outage. Corrected.','messages','[]'::jsonb))
    ) AS t(rn, rec)
  )
)
where key = 'hr_attendance_corrections';

-- ---- 13g. CAB REQUESTS: every status ----
insert into app_store (key, value)
select 'hr_cab_requests', coalesce((select value from app_store where key = 'hr_cab_requests'), '[]'::jsonb)
  || (
    select coalesce(jsonb_agg(rec), '[]'::jsonb) from (values
      (1, jsonb_build_object('id','CABREQX1','employeeId','EMP001','forDates',jsonb_build_array('2026-08-25'),'newLocation','12 Sector 45, Gurugram','newGate','Gate 3','newTime','07:30','reason','Staying near sector 45 for a week.','status','pending','adminNote','','raisedOn','2026-08-23')),
      (2, jsonb_build_object('id','CABREQX2','employeeId','EMP001','forDates',jsonb_build_array('2026-08-10'),'newLocation','5 Sector 22, Noida','newGate','Gate 1','newTime','08:00','reason','Temporary relocation for project work.','status','approved','adminNote','','raisedOn','2026-08-08')),
      (3, jsonb_build_object('id','CABREQX3','employeeId','EMP001','forDates',jsonb_build_array('2026-08-05'),'newLocation','8 Sector 62, Noida','newGate','Gate 5','newTime','09:00','reason','Visiting a friend near Noida.','status','rejected','adminNote','Not possible on that route, sorry.','raisedOn','2026-08-03')),
      (4, jsonb_build_object('id','CABREQX4','employeeId','EMP002','forDates',jsonb_build_array('2026-08-26'),'newLocation','20 Sector 56, Gurugram','newGate','Gate 2','newTime','07:45','reason','Moved to a new apartment temporarily.','status','pending','adminNote','','raisedOn','2026-08-24')),
      (5, jsonb_build_object('id','CABREQX5','employeeId','EMP002','forDates',jsonb_build_array('2026-08-12'),'newLocation','15 Sector 35, Gurugram','newGate','Gate 4','newTime','08:15','reason','Staying with family for a few days.','status','approved','adminNote','','raisedOn','2026-08-10')),
      (6, jsonb_build_object('id','CABREQX6','employeeId','EMP002','forDates',jsonb_build_array('2026-08-03'),'newLocation','30 Sector 14, Gurugram','newGate','Gate 1','newTime','07:00','reason','Hotel stay during apartment renovation.','status','rejected','adminNote','Cab does not cover Sector 14 route.','raisedOn','2026-08-01'))
    ) AS t(rn, rec)
  )
on conflict (key) do update set value = excluded.value, updated_at = now();

-- ---- 13h. CAB MESSAGES for EMP001 & EMP002 ----
insert into app_store (key, value)
select 'hr_cab_messages', coalesce((select value from app_store where key = 'hr_cab_messages'), '[]'::jsonb)
  || (
    select coalesce(jsonb_agg(rec), '[]'::jsonb) from (values
      (1, jsonb_build_object('id','CABMSGX01','employeeId','EMP001','byRole','employee','text','Where is my cab? It is usually here by now.','on','2026-08-24T08:00:00','readByAdmin',true)),
      (2, jsonb_build_object('id','CABMSGX02','employeeId','EMP001','byRole','admin','text','Driver is 5 minutes away, sorry for the wait.','on','2026-08-24T08:05:00','readByAdmin',false)),
      (3, jsonb_build_object('id','CABMSGX03','employeeId','EMP001','byRole','employee','text','Cab reached, coming down.','on','2026-08-24T08:10:00','readByAdmin',false)),
      (4, jsonb_build_object('id','CABMSGX04','employeeId','EMP002','byRole','employee','text','Please wait 2 minutes at the gate.','on','2026-08-24T07:50:00','readByAdmin',true)),
      (5, jsonb_build_object('id','CABMSGX05','employeeId','EMP002','byRole','admin','text','Driver has been informed. Please be at Gate 2.','on','2026-08-24T07:55:00','readByAdmin',false)),
      (6, jsonb_build_object('id','CABMSGX06','employeeId','EMP002','byRole','employee','text','Can the cab come 10 minutes early tomorrow?','on','2026-08-23T18:00:00','readByAdmin',true))
    ) AS t(rn, rec)
  )
on conflict (key) do update set value = excluded.value, updated_at = now();

-- ============ 14. SHIFTS ============
-- Define multiple shifts and assign employees to them.
insert into app_store (key, value)
values (
  'hr_shifts',
  '[
    {"id":"SHIFT_MORNING","name":"Morning Shift","startTime":"06:00","endTime":"14:00"},
    {"id":"SHIFT_AFTERNOON","name":"Afternoon Shift","startTime":"14:00","endTime":"22:00"},
    {"id":"SHIFT_EVENING","name":"Evening Shift","startTime":"18:00","endTime":"02:00"},
    {"id":"SHIFT_NIGHT","name":"Night Shift","startTime":"22:00","endTime":"06:00"}
  ]'::jsonb
)
on conflict (key) do update set value = excluded.value, updated_at = now();

-- Assign all employees to different shifts.
-- Update the hr_employees JSON to add shiftId to all employees.
-- Base employees EMP001-EMP010 get explicit assignments; generated employees
-- are assigned based on their index modulo 4.
update app_store
set value = (
  select jsonb_agg(
    case
      when elem->>'id' = 'EMP001' then elem || '{"shiftId":"SHIFT_MORNING"}'::jsonb
      when elem->>'id' = 'EMP002' then elem || '{"shiftId":"SHIFT_MORNING"}'::jsonb
      when elem->>'id' = 'EMP003' then elem || '{"shiftId":"SHIFT_MORNING"}'::jsonb
      when elem->>'id' = 'EMP004' then elem || '{"shiftId":"SHIFT_AFTERNOON"}'::jsonb
      when elem->>'id' = 'EMP005' then elem || '{"shiftId":"SHIFT_AFTERNOON"}'::jsonb
      when elem->>'id' = 'EMP006' then elem || '{"shiftId":"SHIFT_AFTERNOON"}'::jsonb
      when elem->>'id' = 'EMP007' then elem || '{"shiftId":"SHIFT_EVENING"}'::jsonb
      when elem->>'id' = 'EMP008' then elem || '{"shiftId":"SHIFT_EVENING"}'::jsonb
      when elem->>'id' = 'EMP009' then elem || '{"shiftId":"SHIFT_NIGHT"}'::jsonb
      when elem->>'id' = 'EMP010' then elem || '{"shiftId":"SHIFT_NIGHT"}'::jsonb
      when elem->>'id' like 'EMP%' and elem->>'id' > 'EMP010' then
        elem || jsonb_build_object('shiftId',
          case mod((substring(elem->>'id' from 4)::int - 10), 4)
            when 0 then 'SHIFT_MORNING'
            when 1 then 'SHIFT_AFTERNOON'
            when 2 then 'SHIFT_EVENING'
            else 'SHIFT_NIGHT'
          end)
      else elem
    end
    order by elem->>'id'
  )
  from jsonb_array_elements(value) elem
),
updated_at = now()
where key = 'hr_employees';

-- Shift change history (a few past changes).
insert into app_store (key, value)
values (
  'hr_shift_history',
  '[
    {"id":"SH001","employeeId":"EMP003","fromShiftId":"SHIFT_GENERAL","toShiftId":"SHIFT_MORNING","changedBy":"admin","changedOn":"2026-07-15"},
    {"id":"SH002","employeeId":"EMP007","fromShiftId":"SHIFT_GENERAL","toShiftId":"SHIFT_AFTERNOON","changedBy":"admin","changedOn":"2026-08-01"},
    {"id":"SH003","employeeId":"EMP005","fromShiftId":"SHIFT_GENERAL","toShiftId":"SHIFT_NIGHT","changedBy":"admin","changedOn":"2026-08-10"}
  ]'::jsonb
)
on conflict (key) do update set value = excluded.value, updated_at = now();

-- Shift change requests (a mix of pending, approved, rejected).
insert into app_store (key, value)
values (
  'hr_shift_change_requests',
  '[
    {"id":"SCR001","employeeId":"EMP002","fromShiftId":"SHIFT_MORNING","toShiftId":"SHIFT_AFTERNOON","reason":"I prefer afternoons for productivity.","status":"pending","requestedOn":"2026-08-23","decidedBy":null,"decidedOn":null,"rejectReason":""},
    {"id":"SCR002","employeeId":"EMP008","fromShiftId":"SHIFT_EVENING","toShiftId":"SHIFT_MORNING","reason":"Personal commitment in the evenings.","status":"pending","requestedOn":"2026-08-24","decidedBy":null,"decidedOn":null,"rejectReason":""},
    {"id":"SCR003","employeeId":"EMP010","fromShiftId":"SHIFT_NIGHT","toShiftId":"SHIFT_MORNING","reason":"Want to align shift with college classes.","status":"approved","requestedOn":"2026-08-01","decidedBy":"ADM001","decidedOn":"2026-08-03","rejectReason":""},
    {"id":"SCR004","employeeId":"EMP004","fromShiftId":"SHIFT_AFTERNOON","toShiftId":"SHIFT_MORNING","reason":"Health reasons, doctor advised.","status":"rejected","requestedOn":"2026-08-05","decidedBy":"ADM001","decidedOn":"2026-08-07","rejectReason":"No replacement available for morning shift currently."},
    {"id":"SCR005","employeeId":"EMP002","fromShiftId":"SHIFT_GENERAL","toShiftId":"SHIFT_MORNING","reason":"Requested morning shift when joining.","status":"approved","requestedOn":"2026-07-01","decidedBy":"ADM001","decidedOn":"2026-07-02","rejectReason":""},
    {"id":"SCR006","employeeId":"EMP002","fromShiftId":"SHIFT_MORNING","toShiftId":"SHIFT_NIGHT","reason":"Want to try night shift for a change.","status":"rejected","requestedOn":"2026-07-15","decidedBy":"ADM001","decidedOn":"2026-07-16","rejectReason":"Night shift requires minimum 3 months experience."},
    {"id":"SCR007","employeeId":"EMP002","fromShiftId":"SHIFT_MORNING","toShiftId":"SHIFT_EVENING","reason":"Evening shift suits my schedule better.","status":"withdrawn","requestedOn":"2026-08-01","decidedBy":null,"decidedOn":null,"rejectReason":""},
    {"id":"SCR008","employeeId":"EMP003","fromShiftId":"SHIFT_MORNING","toShiftId":"SHIFT_AFTERNOON","reason":"Afternoon shift is more convenient.","status":"pending","requestedOn":"2026-08-24","decidedBy":null,"decidedOn":null,"rejectReason":""},
    {"id":"SCR009","employeeId":"EMP005","fromShiftId":"SHIFT_AFTERNOON","toShiftId":"SHIFT_EVENING","reason":"Evening shift aligns with my studies.","status":"approved","requestedOn":"2026-08-10","decidedBy":"ADM001","decidedOn":"2026-08-12","rejectReason":""},
    {"id":"SCR010","employeeId":"EMP007","fromShiftId":"SHIFT_EVENING","toShiftId":"SHIFT_NIGHT","reason":"Night shift pays extra allowance.","status":"pending","requestedOn":"2026-08-25","decidedBy":null,"decidedOn":null,"rejectReason":""}
  ]'::jsonb
)
on conflict (key) do update set value = excluded.value, updated_at = now();

-- ---- 13i. SHIFT DATA FOR EMP002: comprehensive coverage ----
-- EMP002 shift history showing multiple changes over time
insert into app_store (key, value)
select 'hr_shift_history', coalesce((select value from app_store where key = 'hr_shift_history'), '[]'::jsonb)
  || (select coalesce(jsonb_agg(rec), '[]'::jsonb) from (values
    (1, jsonb_build_object('id','SHX001','employeeId','EMP002','fromShiftId',null,'toShiftId','SHIFT_GENERAL','changedBy','admin','changedOn','2025-03-15')),
    (2, jsonb_build_object('id','SHX002','employeeId','EMP002','fromShiftId','SHIFT_GENERAL','toShiftId','SHIFT_MORNING','changedBy','ADM001','changedOn','2025-07-02')),
    (3, jsonb_build_object('id','SHX003','employeeId','EMP002','fromShiftId','SHIFT_MORNING','toShiftId','SHIFT_AFTERNOON','changedBy','EMP001','changedOn','2026-01-10')),
    (4, jsonb_build_object('id','SHX004','employeeId','EMP002','fromShiftId','SHIFT_AFTERNOON','toShiftId','SHIFT_MORNING','changedBy','ADM001','changedOn','2026-04-05'))
  ) AS t(rn, rec))
on conflict (key) do update set value = excluded.value, updated_at = now();

commit;

-- Done. Refresh the web app; it will load this data from Supabase.
