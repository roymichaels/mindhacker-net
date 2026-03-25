insert into public.user_roles (user_id, role)
values ('45c37cba-d445-4607-b225-54e4b2edabec', 'admin')
on conflict (user_id, role) do nothing;
