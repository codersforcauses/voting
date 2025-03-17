import { DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";
import { positionsTable, seatTable } from "./schema";

export function seedPositions(db: DrizzleSqliteDODatabase<any>) {
  return db.insert(positionsTable).values([
    {
      title: "President",
      description: "Runs the club",
      priority: 1,
      openings: 1,
    },
    {
      title: "Vice President",
      description: "Assists the President",
      priority: 2,
      openings: 1,
    },
    {
      title: "Secretary",
      description: "Keeps minutes of meetings",
      priority: 3,
      openings: 1,
    },
    {
      title: "Treasurer",
      description: "Manages club finances",
      priority: 4,
      openings: 1,
    },
    {
      title: "Technical Lead",
      description: "Oversees technical projects",
      priority: 5,
      openings: 1,
    },
    {
      title: "Marketing Officer",
      description: "Handles marketing and promotions",
      priority: 6,
      openings: 1,
    },
    {
      title: "Fresher Representative",
      description: "Represents the interests of first year students",
      priority: 7,
      openings: 1,
    },
    {
      title: "Ordinary Committee Member",
      description: "General committee member",
      priority: 8,
      openings: 6,
    },
  ]);
}

export function seedSeats(db: DrizzleSqliteDODatabase<any>) {
  return db.insert(seatTable).values([
    {
      code: "000000",
    },
    {
      code: "010101",
    },
  ]);
}
