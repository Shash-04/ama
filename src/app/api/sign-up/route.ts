import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    const existingVerifiedUserByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUserByUsername) {
      return Response.json(
        {
          success: false,
          message: 'Username is already taken',
        },
        { status: 400 }
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: 'User already exists with this email',
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = "123456"; // Hardcoded verification code
        existingUserByEmail.verifyCodeExpiry = new Date("2035-01-01"); // Hardcoded expiry
        existingUserByEmail.isVerified = true; // User is always verified
        existingUserByEmail.isAcceptingMessages = true; // Always accepting messages
        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode: "123456", // Hardcoded verification code
        verifyCodeExpiry: new Date("2035-01-01"), // Hardcoded expiry
        isVerified: true, // User is always verified
        isAcceptingMessages: true, // Always accepting messages
        messages: [],
      });

      await newUser.save();
    }

    return Response.json(
      {
        success: true,
        message: 'User registered successfully.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering user:', error);
    return Response.json(
      {
        success: false,
        message: 'Error registering user',
      },
      { status: 500 }
    );
  }
}
