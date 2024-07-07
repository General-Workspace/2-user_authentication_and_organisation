import request from "supertest";
import { App } from "../src/app";
import prisma from "../src/config/prisma.config";
import bcryptHelper, { BcryptHelper } from "../src/utils/helpers/bcrypt.helper";
import jwtService, { JWTService } from "../src/utils/helpers/jwt.helpers";
import { Application } from "express";

interface MockUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string | null;
}

// mock user data
const mockUserData = {
  firstName: "John",
  lastName: "Doe",
  email: "johndoe@test.com",
  password: "Test123$",
  phone: "08012345678",
};

// helper functions to clear the database before each test
const clearDatabase = async () => {
  await prisma.organisationUser.deleteMany({});
  await prisma.organisation.deleteMany({});
  await prisma.user.deleteMany({});
};

let app: Application;
let token: string;
let orgId: string;
let hashedPassword: string;
let existingUser: MockUser;

describe("POST /auth/register", () => {
  beforeAll(async () => {
    app = new App().app;
  });

  beforeEach(async () => {
    await clearDatabase();
    // hash the password before saving to the database
    const bcryptHelper = new BcryptHelper();
    const hashedPassword = await bcryptHelper.hashPassword(
      mockUserData.password
    );
    mockUserData.password = hashedPassword;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should register a new user with default organisation", async () => {
    const response = await request(app)
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

    const user = await prisma.user.findUnique({
      where: { email: mockUserData.email },
    });

    expect(user).toBeTruthy();
    expect(user?.firstName).toBe(mockUserData.firstName);
    expect(user?.lastName).toBe(mockUserData.lastName);
    expect(user?.email).toBe(mockUserData.email);
    expect(user?.phone).toBe(mockUserData.phone);

    await prisma.organisation.create({
      data: {
        name: `${user?.firstName}'s Organisation`,
        description: "",
        userId: user?.userId as string,
      },
    });

    const jwtService = new JWTService(
      process.env["JWT_SECRET"] as string,
      "1h"
    );
    const accessToken = jwtService.generateToken({ email: mockUserData.email });
    expect(accessToken).toBeTruthy();
  });

  it("should return validation error if fields are missing", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      })
      .expect(422);

    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors.firstName.message).toBe(
      "First name cannot be empty"
    );
    expect(response.body.errors.lastName.message).toBe(
      "Last name cannot be empty"
    );
    expect(response.body.errors.email.message).toBe("Email cannot be empty");
    expect(response.body.errors.password.message).toBe(
      "Password cannot be empty"
    );
  });

  it("should return an error if user already exists", async () => {
    await prisma.user.create({
      data: mockUserData,
    });

    const response = await request(app)
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
    app = new App().app;
  });

  beforeEach(async () => {
    await clearDatabase();

    // hash the password before saving to the database
    const bcryptHelper = new BcryptHelper();
    const hashedPassword = await bcryptHelper.hashPassword(
      mockUserData.password
    );
    mockUserData.password = hashedPassword;

    const user = await prisma.user.create({
      data: mockUserData,
    });

    const jwtService = new JWTService(
      process.env["JWT_SECRET"] as string,
      "1h"
    );
    // token = jwtService.generateToken({ email: mockUserData.email });
    token = jwtService.generateToken({ email: mockUserData.email });

    const organisation = await prisma.organisation.create({
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
    await prisma.$disconnect();
  });

  it("should verify the default organisation name is correctly generated", async () => {
    const response = await request(app)
      .get(`/api/organisations/${orgId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty("data");
    expect(response.body).toHaveProperty("message");
    expect(response.body.data).toHaveProperty("orgId");
    expect(response.body.data).toHaveProperty("name");
    expect(response.body.data).toHaveProperty("description");

    expect(response.body.data.name).toBe(
      `${mockUserData.firstName}'s Organisation`
    );
    expect(response.body.message).toBe("Organisation retrieved successfully");
    expect(response.body.statusCode).toBe(200);
  });
});

describe("POST /auth/login", () => {
  beforeAll(async () => {
    app = new App().app;
  });

  beforeEach(async () => {
    await clearDatabase();

    const bcryptHelper = new BcryptHelper();
    hashedPassword = await bcryptHelper.hashPassword("Test123$");

    existingUser = await prisma.user.create({
      data: {
        firstName: "Jane",
        lastName: "Doe",
        email: "janedoe@test.com",
        password: hashedPassword,
        phone: "08012345678",
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should login a user successfully", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: existingUser.email, password: "Test123$" })
      .expect(200);

    const user = await prisma.user.findUnique({
      where: {
        email: existingUser.email,
      },
    });

    await bcryptHelper.comparePassword("Test123$", user?.password as string);

    jwtService.generateToken({ email: existingUser.email });

    expect(response.body).toHaveProperty("data");
    expect(response.body).toHaveProperty("message");
    expect(response.body.data).toHaveProperty("accessToken");
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data.user).toHaveProperty("userId");
    expect(response.body.data.user).toHaveProperty("firstName");
    expect(response.body.data.user).toHaveProperty("lastName");
    expect(response.body.data.user).toHaveProperty("email");
    expect(response.body.data.user).toHaveProperty("phone");

    expect(response.body.data.user.firstName).toBe(existingUser.firstName);
    expect(response.body.data.user.lastName).toBe(existingUser.lastName);
    expect(response.body.data.user.email).toBe(existingUser.email);
    expect(response.body.data.user.phone).toBe(existingUser.phone);
    expect(response.body.message).toBe("Login successful");
    expect(response.body.statusCode).toBe(200);
    expect(response.body.data.accessToken).toBeTruthy();
  });
});
