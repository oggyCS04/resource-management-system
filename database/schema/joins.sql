 -- JOIN FOR STUDENTS
 select *
            from rms.students s
            join rms.users u
            on s.user_id = u.id
            join rms.class c
            on s.class_id = c.class_id

 -- JOIN FOR TEACHERS
 select *
            from rms.users u
            join rms.teachers t
            on u.id = t.user_id

 --JOIN FOR DEPARTMENT           
SELECT
                d.department_id,
                d.name,
                COUNT(DISTINCT c.class_id) AS total_classes,
                COUNT(DISTINCT t.teacher_id) AS total_teachers,
                COUNT(DISTINCT s.student_id) AS total_students
                FROM rms.department d
                LEFT JOIN rms.class c
                ON d.department_id = c.department_id
                LEFT JOIN rms.teachers t
                ON d.department_id = t.department_id
                LEFT JOIN rms.students s
                ON c.class_id = s.class_id
                GROUP BY
                d.department_id,
                d.name
                ORDER BY
                d.department_id;
    
--JOIN FOR RESOURCES

SELECT
                r.resource_id,
                r.title,
                r.type,
                r.uploaded_by,
                r.date_uploaded,
                COUNT(rt.target_id) AS target_count
                FROM rms.resource r
                LEFT JOIN rms.resourcetarget rt
                ON r.resource_id = rt.resource_id
                GROUP BY
                r.resource_id,
                r.title,
                r.type,
                r.uploaded_by,
                r.date_uploaded
                ORDER BY
                r.date_uploaded DESC;

--JOIN FOR DASHBOARD

 SELECT
                s.total_students,
                t.total_teachers,
                d.total_departments,
                c.total_classes,
                r.total_resources
            FROM
                (SELECT COUNT(*) AS total_students
                 FROM rms.students st
                 JOIN rms.users u ON st.user_id = u.id
                 WHERE u.is_active = true) s,

                (SELECT COUNT(*) AS total_teachers
                 FROM rms.teachers tc
                 JOIN rms.users u ON tc.user_id = u.id
                 WHERE u.is_active = true) t,

                (SELECT COUNT(*) AS total_departments
                 FROM rms.department) d,

                (SELECT COUNT(*) AS total_classes
                 FROM rms.class) c,

                (SELECT COUNT(*) AS total_resources
                 FROM rms.resource) r