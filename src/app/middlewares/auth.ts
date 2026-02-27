import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Secret } from "jsonwebtoken";
import config from "src/config/index.js";
import ApiError from "src/errors/ApiError.js";
import { jwtHelper } from "src/helpers.ts/jwtHelper.js";

const auth =
  (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenWithBearer = req.headers.authorization;
      if (!tokenWithBearer) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized");
      }

      if (tokenWithBearer && !tokenWithBearer.startsWith("Bearer")) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Invalid Token format! Token must startsWith Bearer",
        );
      }
      if (tokenWithBearer && tokenWithBearer.startsWith("Bearer")) {
        const token = tokenWithBearer.split(" ")[1];

        //verify token
        const verifyUser = jwtHelper.verifyToken(
          token,
          config.jwt.jwt_secret as Secret,
        );
        //set user to header
        req.user = verifyUser;

        console.log(verifyUser, roles);

        //guard user
        if (roles.length && !roles.includes(verifyUser.role)) {
          throw new ApiError(
            StatusCodes.FORBIDDEN,
            "You don't have permission to access this api",
          );
        }

        next();
      }
    } catch (error) {
      next(error);
    }
  };

export default auth;
