// Schemas for form validation using Zod
const { z } = window.Zod;

// Email schema with PUP domain validation
const emailSchema = z.string()
    .email("Invalid email address")
    .refine(email => email.endsWith('@pup.edu.ph'), {
        message: "Email must be a PUP email (@pup.edu.ph)"
    });

// Password schema with complexity requirements
const passwordSchema = z.string()
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
    });

// Username schema
const usernameSchema = z.string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must not exceed 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");

// Student number schema
const studentNumberSchema = z.string()
    .regex(/^\d{4}-\d{5}-[A-Z]{2}-\d$/, "Student number must match pattern: YYYY-XXXXX-LL-X");

// Combined signup schema
const signUpSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    username: usernameSchema,
    studentNumber: studentNumberSchema
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

// Individual forum schemas
const titleSchema = z.string()
    .min(5, "Title must be at least 5 characters long")
    .max(100, "Title must not exceed 100 characters");


const contentSchema = z.string()
    .min(20, "Post content must be at least 20 characters long")
    .max(5000, "Post content must not exceed 5000 characters");


// Define allowed tags
const allowedTags = [
    "freshman", 
    "requirements", 
    "programming", 
    "review", 
    "resource", 
    "lost and found"
];

// Update tags schema with allowed values
const tagsSchema = z.array(z.string()
    .refine(tag => allowedTags.includes(tag), {
        message: `Tag must be one of the following: ${allowedTags.join(', ')}`
    }))
    .optional()
    .default([])
    .refine(tags => tags.length <= 5, {
            message: "Maximum 5 tags allowed"
    });

// Anonymous schema for forum posts
const anonymousSchema = z.boolean()
    .default(false)
    .optional()

// Attachment schema for PDF files
const attachmentSchema = z.instanceof(File)
    .refine(file => file.type === 'application/pdf', {
        message: "File must be a PDF"
    })
    .optional()

// Combined forum post schema
const forumPostSchema = z.object({
    title: titleSchema,
    content: contentSchema,
    tags: tagsSchema,
    anonymous: anonymousSchema,
    attachment: attachmentSchema,
    created_at: z.date().default(() => new Date())
});

const commentSchema = z.object({
    content: z.string()
        .min(1, "Comment content must not be empty")
        .max(1000, "Comment content must not exceed 1000 characters"),
    });

// Schema lookup dictionary for efficient field validation
const schemaLookup = {
    'email': emailSchema,
    'password': passwordSchema,
    'username': usernameSchema,
    'studentNumber': studentNumberSchema,
    'title': titleSchema,
    'content': contentSchema,
    'tags': tagsSchema,
    'anonymous': anonymousSchema,
    'attachment': attachmentSchema,
    'comment': commentSchema
};

// Function to validate a single field
function validateField(fieldName, value) {
    try {
        const schema = schemaLookup[fieldName];
        if (!schema) {
            throw new Error("Unknown field");
        }
        
        const result = schema.parse(value);
        return { isValid: true, value: result, error: null };
    } catch (error) {
        return { isValid: false, value: null, error: error.issues};
    }
}

// Function to validate signup data
function validateSignUp(formData) {
    try {
        const validData = signUpSchema.parse(formData);
        return { isValid: true, data: validData, error: null };
    } catch (error) {
        return { isValid: false, data: null, error: error.issues };
    }
}

// Function to validate forum post data
function validateForumPost(formData) {
    try {
        const validPost = forumPostSchema.parse(formData);
        return { isValid: true, data: validPost, error: null };
    } catch (error) {
        return { isValid: false, data: null, error: error.issues };
    }
}

function validateLogin(formData) {
    try {
        const validLogin = z.object({
            email: emailSchema,
            password: passwordSchema
        }).parse(formData);
        return { isValid: true, data: validLogin, error: null };
    } catch (error) {
        return { isValid: false, data: null, error: error.issues };
    }
}

// Function to preload schemas
function preloadSchemas() {
    try {
        // Use safeParse with empty objects to preload schemas
        signUpSchema.safeParse({});
        forumPostSchema.safeParse({});
        commentSchema.safeParse({});
        
        console.log("Schemas preloaded successfully");
        return true;
    } catch (error) {
        console.error("Error preloading schemas:", error);
        return false;
    }
}

// Export schemas
export { validateSignUp, validateForumPost, validateField, validateLogin,
        preloadSchemas };
