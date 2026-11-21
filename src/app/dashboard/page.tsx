useEffect(() => {
    const hasAuth = document.cookie
      .split("; ")
      .some((row) => row.startsWith("staff_admin_auth=1"));

    if (!hasAuth) {
      router.replace("/");
      return;
    }

    const rawSession = localStorage.getItem("sm_erp_session");
    if (rawSession) {
      try {
        const session = JSON.parse(rawSession) as {
          role?: string;
          departmentCode?: string;
        };
        if (session.role !== "SENIOR_EXEC_ADMIN") {
          const targetDept =
            DEPARTMENTS.find((d) => d.code === session.departmentCode) || DEPARTMENTS[0];
          router.replace(`/departments/${targetDept.slug}`);
          return;
        }
      } catch {}
    }

    setAuthorized(true);

    const savedStaff = localStorage.getItem("sm_erp_staff");
    if (savedStaff) {
      try {
        setStaffList(JSON.parse(savedStaff));
      } catch {}
    }

    const savedTimeline = localStorage.getItem("sm_erp_timeline");
    if (savedTimeline) {
      try {
        setTimeline(JSON.parse(savedTimeline));
      } catch {}
    }
  }, [router]);
