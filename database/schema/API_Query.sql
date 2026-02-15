-- fetch all user 

SELECT id, full_name, email, role_id, is_active
            FROM rms.users
            ORDER BY id DESC


--add new user
INSERT INTO rms.users (full_name, email, password, role_id, is_active)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id
--add new student
INSERT INTO rms.students(user_id,class_id,campus_rollno)
                    VALUES ($1, $2, $3)

--add new teacher
INSERT INTO rms.teachers(user_id, department_id)
                    VALUES ($1, $2)


--delete user
DELETE FROM rms.users WHERE id = $1


--fetch all students
  select *
            from rms.students s
            join rms.users u
            on s.user_id = u.id
            join rms.class c
            on s.class_id = c.class_id

--fetch all teacher
 select *
            from rms.users u
            join rms.teachers t
            on u.id = t.user_id


--get single user
SELECT * FROM rms.users WHERE id = $1

--update user
 UPDATE rms.users 
                SET 
                    full_name = COALESCE($1, full_name),
                    email = COALESCE($2, email),
                    is_active = COALESCE($3, is_active),
                    password = COALESCE($4, password)
                WHERE id = $5
--update student
UPDATE rms.students
                SET 
                    class_id = COALESCE($1, class_id),
                    campus_rollno = COALESCE($2, campus_rollno)
                WHERE user_id = $3
                AND EXISTS (
                    SELECT 1 FROM rms.users 
                    WHERE id = $3 AND role_id = 2
                )

--update table 
UPDATE rms.teachers
                SET 
                    department_id = COALESCE($1, department_id)
                WHERE user_id = $2
                AND EXISTS (
                    SELECT 1 FROM rms.users 
                    WHERE id = $2 AND role_id = 1
                )