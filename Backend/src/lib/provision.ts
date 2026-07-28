import { getSupabaseAdmin } from "./supabase.js";
import { generateTempPassword, sendStudentWelcomeEmail } from "./mail.js";

/**
 * After payment succeeds: create Auth user (if needed), profile, enrollment,
 * mark application active, set a temporary password, and email credentials.
 */
export async function provisionStudentFromApplication(applicationId: string) {
  const supabase = getSupabaseAdmin();

  const { data: application, error } = await supabase
    .from("applications")
    .select(
      "id, name, email, phone, institution, course_id, status, user_id, courses(name)"
    )
    .eq("id", applicationId)
    .single();

  if (error) throw error;
  if (!application) throw new Error("Application not found");

  const courseRel = application.courses as
    | { name?: string }
    | Array<{ name?: string }>
    | null;
  const courseName = Array.isArray(courseRel)
    ? courseRel[0]?.name
    : courseRel?.name;

  let userId = application.user_id as string | null;

  if (!userId) {
    const { data: listed } = await supabase.auth.admin.listUsers({
      perPage: 1000,
    });
    const existing = listed?.users?.find(
      (u) => u.email?.toLowerCase() === application.email.toLowerCase()
    );

    if (existing) {
      userId = existing.id;
    } else {
      const { data: created, error: createError } =
        await supabase.auth.admin.createUser({
          email: application.email,
          email_confirm: true,
          user_metadata: {
            full_name: application.name,
            role: "student",
            phone: application.phone,
            institution: application.institution,
          },
        });
      if (createError) throw createError;
      userId = created.user?.id ?? null;
    }
  }

  if (!userId) throw new Error("Failed to resolve student user id");

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    full_name: application.name,
    phone: application.phone,
    institution: application.institution,
    role: "student",
    updated_at: new Date().toISOString(),
  });
  if (profileError) throw profileError;

  const { error: enrollError } = await supabase.from("enrollments").upsert(
    {
      user_id: userId,
      course_id: application.course_id,
      application_id: application.id,
      status: "active",
      enrolled_at: new Date().toISOString(),
    },
    { onConflict: "user_id,course_id" }
  );
  if (enrollError) throw enrollError;

  const { error: appError } = await supabase
    .from("applications")
    .update({
      status: "active",
      user_id: userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", application.id);
  if (appError) throw appError;

  const tempPassword = generateTempPassword();

  try {
    const { error: pwError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: application.name,
          role: "student",
          phone: application.phone,
          institution: application.institution,
        },
      }
    );
    if (pwError) throw pwError;

    await sendStudentWelcomeEmail({
      to: application.email,
      name: application.name,
      password: tempPassword,
      courseName,
    });
  } catch (emailErr) {
    console.warn("[provision] welcome credentials email failed:", emailErr);
  }

  return { userId, email: application.email };
}

/** Re-issue temp password + welcome email for an existing paid/active application. */
export async function resendStudentCredentials(applicationId: string) {
  return provisionStudentFromApplication(applicationId);
}
