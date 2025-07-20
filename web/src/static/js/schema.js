// Schemas for form validation using Zod
import { z } from 'zod';

const signUpSchema = z.object({
    email: z.string()
             .email("Invalid email address")
             .refine(email => email.endsWith('@pup.edu.ph'), {
                message: "Email must be a PUP email (@pup.edu.ph)"
             }),
    password: z.string()
                .min(8, "Password must be at least 8 characters long")
                .max(64, "Password must not exceed 64 characters")
                .refine(password => /[A-Z]/.test(password), {
                    message: "Password must contain at least one uppercase letter"
                })
                .refine(password => /[0-9]/.test(password), {
                    message: "Password must contain at least one number"
                })
                .refine(password => /[^A-Za-z0-9]/.test(password), {
                    message: "Password must contain at least one special character"
                }),
    confirm_password: z.string(),
    username: z.string()
                .min(3, "Username must be at least 3 characters long")
                .max(20, "Username must not exceed 20 characters")
                .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    student_number: z.string()
                .regex(/^\d{4}-\d{5}-[A-Z]{2}-\d$/, "Student number must match pattern: YYYY-XXXXX-LL-X")

}).refine(data => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"]
})

const forumPostSchema = z.object({
    title: z.string()
        .min(5, "Title must be at least 5 characters long")
        .max(100, "Title must not exceed 100 characters"),
    content: z.string()
        .min(20, "Post content must be at least 20 characters long")
        .max(5000, "Post content must not exceed 5000 characters"),
    tags: z.array(z.string())
        .optional()
        .default([])
        .refine(tags => tags.length <= 5, {
            message: "Maximum 5 tags allowed"
        }),
    created_at: z.date().default(() => new Date())
});

// Function to validate signup form data
function validateSignUp(formData) {
    try {
        const validData = signUpSchema.parse(formData);
        return { isValid: true, data: validData, error: null };
    } catch (error) {
        return { isValid: false, data: null, error: error.errors };
    }
}

// Function to validate forum post data
function validateForumPost(formData) {
    try {
        const validPost = forumPostSchema.parse(formData);
        return { isValid: true, data: validPost, error: null };
    } catch (error) {
        return { isValid: false, data: null, error: error.errors };
    }
}

// Function to preload schemas
async function preloadSchemas() {
    try {
        // Use safeParse with empty objects to preload schemas
        signUpSchema.safeParse({});
        forumPostSchema.safeParse({});
        
        console.log("Schemas preloaded successfully");
        return true;
    } catch (error) {
        console.error("Error preloading schemas:", error);
        return false;
    }
}

// Export schemas
export { validateSignUp, validateForumPost, preloadSchemas };

