"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
const prisma_config_1 = __importDefault(require("../src/config/prisma.config"));
const bcrypt_helper_1 = require("../src/utils/helpers/bcrypt.helper");
const jwt_helpers_1 = require("../src/utils/helpers/jwt.helpers");
// mock user data
const mockUserData = {
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@test.com",
    password: "Test123$",
    phone: "08012345678",
};
// const mockLoginData = {
//   email: "johndoe@test.com",
//   password: "Test123$",
// };
// helper functions to clear the database before each test
const clearDatabase = async () => {
    await prisma_config_1.default.organisationUser.deleteMany({});
    await prisma_config_1.default.organisation.deleteMany({});
    await prisma_config_1.default.user.deleteMany({});
};
let app;
let token;
let orgId;
// let hashedPassword: string;
describe("POST /auth/register", () => {
    beforeAll(async () => {
        app = new app_1.App().app;
    });
    beforeEach(async () => {
        await clearDatabase();
        // hash the password before saving to the database
        const bcryptHelper = new bcrypt_helper_1.BcryptHelper();
        const hashedPassword = await bcryptHelper.hashPassword(mockUserData.password);
        mockUserData.password = hashedPassword;
    });
    afterAll(async () => {
        await prisma_config_1.default.$disconnect();
    });
    it("should register a new user with default organisation", async () => {
        const response = await (0, supertest_1.default)(app)
            .post("/auth/register")
            .send(mockUserData)
            .expect(201);
        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("message");
        expect(response.body.data).toHaveProperty("accessToken");
        expect(response.body.data).toHaveProperty("user");
        expect(response.body.data.user).toHaveProperty("userId");
        expect(response.body.data.user).toHaveProperty("firstName");
        expect(response.body.data.user).toHaveProperty("lastName");
        expect(response.body.data.user).toHaveProperty("email");
        expect(response.body.data.user).toHaveProperty("phone");
        expect(response.body.data.user.firstName).toBe(mockUserData.firstName);
        expect(response.body.data.user.lastName).toBe(mockUserData.lastName);
        expect(response.body.data.user.email).toBe(mockUserData.email);
        expect(response.body.data.user.phone).toBe(mockUserData.phone);
        expect(response.body.message).toBe("Registration Successful");
        expect(response.body.statusCode).toBe(201);
        expect(response.body.data.accessToken).toBeTruthy();
        const user = await prisma_config_1.default.user.findUnique({
            where: { email: mockUserData.email },
        });
        expect(user).toBeTruthy();
        expect(user?.firstName).toBe(mockUserData.firstName);
        expect(user?.lastName).toBe(mockUserData.lastName);
        expect(user?.email).toBe(mockUserData.email);
        expect(user?.phone).toBe(mockUserData.phone);
        await prisma_config_1.default.organisation.create({
            data: {
                name: `${user?.firstName}'s Organisation`,
                description: "",
                userId: user?.userId,
            },
        });
        const jwtService = new jwt_helpers_1.JWTService(process.env["JWT_SECRET"], "1h");
        const accessToken = jwtService.generateToken({ email: mockUserData.email });
        expect(accessToken).toBeTruthy();
    });
    it("should return validation error if fields are missing", async () => {
        const response = await (0, supertest_1.default)(app)
            .post("/auth/register")
            .send({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
        })
            .expect(422);
        expect(response.body).toHaveProperty("errors");
        expect(response.body.errors.firstName.message).toBe("First name cannot be empty");
        expect(response.body.errors.lastName.message).toBe("Last name cannot be empty");
        expect(response.body.errors.email.message).toBe("Email cannot be empty");
        expect(response.body.errors.password.message).toBe("Password cannot be empty");
    });
    it("should return an error if user already exists", async () => {
        await prisma_config_1.default.user.create({
            data: mockUserData,
        });
        const response = await (0, supertest_1.default)(app)
            .post("/auth/register")
            .send(mockUserData)
            .expect(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("statusCode");
        expect(response.body).toHaveProperty("status");
        expect(response.body.message).toBe("Registration unsuccessful.");
        expect(response.body.status).toBe("Bad request");
        expect(response.body.statusCode).toBe(400);
    });
});
describe("GET /organisations/:orgId", () => {
    beforeAll(async () => {
        app = new app_1.App().app;
    });
    beforeEach(async () => {
        await clearDatabase();
        // hash the password before saving to the database
        const bcryptHelper = new bcrypt_helper_1.BcryptHelper();
        const hashedPassword = await bcryptHelper.hashPassword(mockUserData.password);
        mockUserData.password = hashedPassword;
        const user = await prisma_config_1.default.user.create({
            data: mockUserData,
        });
        const jwtService = new jwt_helpers_1.JWTService(process.env["JWT_SECRET"], "1h");
        // token = jwtService.generateToken({ email: mockUserData.email });
        token = jwtService.generateToken({ email: mockUserData.email });
        const organisation = await prisma_config_1.default.organisation.create({
            data: {
                name: `${user.firstName}'s Organisation`,
                description: "",
                userId: user.userId,
            },
        });
        // orgId = organisation.orgId;
        orgId = organisation.orgId;
    });
    afterAll(async () => {
        await prisma_config_1.default.$disconnect();
    });
    it("should verify the default organisation name is correctly generated", async () => {
        const response = await (0, supertest_1.default)(app)
            .get(`/api/organisations/${orgId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("message");
        expect(response.body.data).toHaveProperty("orgId");
        expect(response.body.data).toHaveProperty("name");
        expect(response.body.data).toHaveProperty("description");
        expect(response.body.data.name).toBe(`${mockUserData.firstName}'s Organisation`);
        expect(response.body.message).toBe("Organisation retrieved successfully");
        expect(response.body.statusCode).toBe(200);
    });
});
// describe("POST /auth/login", () => {
//   beforeAll(async () => {
//     app = new App().app;
//   });
//   beforeEach(async () => {
//     await clearDatabase();
//     const bcryptHelper = new BcryptHelper();
//     hashedPassword = await bcryptHelper.hashPassword(mockUserData.password);
//     mockUserData.password = hashedPassword;
//     await prisma.user.create({
//       data: mockUserData,
//     });
//     const user = await prisma.user.findUnique({
//       where: { email: mockLoginData.email },
//     });
//     const isPasswordValid = await bcryptHelper.comparePassword(
//       mockLoginData.password,
//       user?.password as string
//     );
//     console.log(isPasswordValid);
//     const jwtService = new JWTService(
//       process.env["JWT_SECRET"] as string,
//       "1h"
//     );
//     token = jwtService.generateToken({ email: mockUserData.email });
//   });
//   afterAll(async () => {
//     await prisma.$disconnect();
//   });
//   it("should login a user successfully", async () => {
//     const response = await request(app)
//       .post("/auth/login")
//       .send(mockLoginData)
//       .expect(200);
//     expect(response.body).toHaveProperty("data");
//     expect(response.body).toHaveProperty("message");
//     expect(response.body.data).toHaveProperty("accessToken");
//     expect(response.body.data).toHaveProperty("user");
//     expect(response.body.data.user).toHaveProperty("userId");
//     expect(response.body.data.user).toHaveProperty("firstName");
//     expect(response.body.data.user).toHaveProperty("lastName");
//     expect(response.body.data.user).toHaveProperty("email");
//     expect(response.body.data.user).toHaveProperty("phone");
//     expect(response.body.data.user.firstName).toBe(mockUserData.firstName);
//     expect(response.body.data.user.lastName).toBe(mockUserData.lastName);
//     expect(response.body.data.user.email).toBe(mockUserData.email);
//     expect(response.body.data.user.phone).toBe(mockUserData.phone);
//     expect(response.body.message).toBe("Login Successful");
//     expect(response.body.statusCode).toBe(200);
//     expect(response.body.data.accessToken).toBeTruthy();
//   });
// });
