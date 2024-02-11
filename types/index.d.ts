import API from "../assets/classes/API";

import { Express as ExpressImport } from "express";

export {};

declare global {
  namespace Express {
    interface Request extends ExpressImport.Request {
      API: API;
      User?: User;
    }
  }

  namespace QuoiBouffeEt {
    interface JWTPayload {
      userId: string;
      tokenId: string
    }

    interface UserData {
      id: string;
      username: string;
      email: string;
      password: string;
      permissionLevel: number;
    }

    interface UserDataWithToken extends UserData {
      tokenExpiresAt: string;
      tokenValidity: boolean;
    }

    interface TypeData {
      id: string;
      name: string;
      slug: string;
      description: string;
    }

    interface UnitData {
      id: string;
      name: string;
      slug: string;
      short: string;
    }

    interface StepData {
      id: string;
      name: string;
      description: string;
      image: string;
      stepTime: string;
    }

    interface IngredientData {
      id: string;
      name: string;
      slug: string;
      description: string;
      types: string;
      image: string;
      quantity?: number;
      unit?: UnitData;
    }

    interface RecipeData {
      id: string;
      name: string;
      slug: string;
      description: string;
      ingredients: string;
      preparationTime: number;
      ingredients: string;
      steps: string;
      image: string;
    }
  }
}