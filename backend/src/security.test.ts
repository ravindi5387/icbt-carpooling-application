import dotenv from "dotenv";

dotenv.config();

const runTests = async () => {
  const { hashPassword, comparePassword } = await import("./utils/password");
  const { generateToken, verifyToken } = await import("./utils/jwt");
  const { registerSchema, loginSchema } = await import(
    "./validators/auth.validator"
  );

  console.log("\n🔐 SECURITY TESTS\n");

  // 1. Password hashing
  const password = "StrongPassword123!";
  const hashedPassword = await hashPassword(password);

  console.log("1. Password hashing:");

  if (hashedPassword !== password && hashedPassword.length > 0) {
    console.log("   ✅ PASS - Password was hashed");
  } else {
    console.log("   ❌ FAIL - Password was not hashed");
  }

  // 2. Correct password
  const correctPassword = await comparePassword(
    password,
    hashedPassword
  );

  console.log("2. Correct password verification:");

  if (correctPassword) {
    console.log("   ✅ PASS - Correct password accepted");
  } else {
    console.log("   ❌ FAIL - Correct password rejected");
  }

  // 3. Wrong password
  const wrongPassword = await comparePassword(
    "WrongPassword123!",
    hashedPassword
  );

  console.log("3. Wrong password rejection:");

  if (!wrongPassword) {
    console.log("   ✅ PASS - Wrong password rejected");
  } else {
    console.log("   ❌ FAIL - Wrong password accepted");
  }

  // 4. JWT generation
  const token = generateToken({
    userId: 1,
    role: "PASSENGER",
  });

  console.log("4. JWT generation:");

  if (token && token.split(".").length === 3) {
    console.log("   ✅ PASS - JWT generated");
  } else {
    console.log("   ❌ FAIL - JWT generation failed");
  }

  // 5. JWT verification
  const decoded = verifyToken(token);

  console.log("5. JWT verification:");

  if (decoded.userId === 1 && decoded.role === "PASSENGER") {
    console.log("   ✅ PASS - JWT verified");
  } else {
    console.log("   ❌ FAIL - JWT verification failed");
  }

  // 6. Register validation
  const validRegistration = registerSchema.safeParse({
    firstName: "Ravindi",
    lastName: "Perera",
    email: "ravindi@example.com",
    password: "StrongPassword123!",
    phone: "0712345678",
    role: "PASSENGER",
  });

  console.log("6. Valid registration validation:");

  if (validRegistration.success) {
    console.log("   ✅ PASS - Valid registration accepted");
  } else {
    console.log("   ❌ FAIL - Valid registration rejected");
  }

  // 7. Invalid email
  const invalidLogin = loginSchema.safeParse({
    email: "invalid-email",
    password: "StrongPassword123!",
  });

  console.log("7. Invalid email rejection:");

  if (!invalidLogin.success) {
    console.log("   ✅ PASS - Invalid email rejected");
  } else {
    console.log("   ❌ FAIL - Invalid email accepted");
  }

  console.log("\n🎉 Security testing completed.\n");
};

runTests().catch((error) => {
  console.error("❌ Security test failed:", error);
  process.exit(1);
});