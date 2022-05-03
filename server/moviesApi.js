import { Router } from "express";

export function MoviesApi(mongoDatabase) {
  const router = new Router();
  router.get("/", async (req, res) => {
    const movies = await mongoDatabase
      .collection("movies")
      .find()
      .map(({ title, year, plot, genre, poster }) => ({
        title,
        year,
        plot,
        genre,
        poster,
      }))
      .limit(100)
      .toArray();
    res.json(movies);
  });

  router.post("/new", (req, res) => {
    const { title, plot, year } = req.body;
    mongoDatabase.collection("movies").insertOne({ title, plot, year });
    res.sendStatus(204);
  });
  return router;
}
