import React, { useContext, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

const ProfileContext = React.createContext({
  userinfo: undefined,
});

function FrontPage({ reload }) {
  const { userinfo } = useContext(ProfileContext);

  async function handleLogout() {
    await fetch("/api/login", { method: "delete" });
    reload();
  }

  return (
    <div>
      <h1>Front Page</h1>
      {!userinfo && (
        <div>
          <Link to={"/login"}>Log in</Link>
        </div>
      )}

      {userinfo && (
        <div>
          <Link to={"/profile"}>Profile for {userinfo.name}</Link>
        </div>
      )}
      {userinfo && (
        <div>
          <button onClick={handleLogout}>Log out</button>
        </div>
      )}
      {userinfo && (
        <div>
          <h1>Movie Database</h1>
          <ul>
            <li>
              <Link to={"/movies"}>List movies</Link>
            </li>
            <li>
              <Link to={"/movies/new"}>Add new movie</Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

async function fetchJSON(url, options = {}) {
  options.json && console.log("fromFetch" + JSON.stringify(options.json));
  const res = await fetch(url, {
    method: options.method || "get",
    headers: options.json ? { "Content-Type": "application/json" } : {},
    body: options.json && JSON.stringify(options.json),
  });
  if (!res.ok) {
    throw new Error(`Failed ${res.status}: ${(await res).statusText}`);
  }
  if (res.status === 200) {
    return await res.json();
  }
}

function Login() {
  const { oauth_config } = useContext(ProfileContext);
  useEffect(async () => {
    const { discovery_url, client_id, scope } = oauth_config;
    const discoveryDocument = await fetchJSON(discovery_url);
    const { authorization_endpoint } = discoveryDocument;
    const params = {
      response_type: "token",
      response_mode: "fragment",
      scope,
      client_id,
      redirect_uri: window.location.origin + "/login/callback",
    };
    window.location.href =
      authorization_endpoint + "?" + new URLSearchParams(params);
  }, []);
  return <h1>Please wait</h1>;
}

function LoginCallback({ reload }) {
  const navigate = useNavigate();

  async function callBack() {
    const { access_token } = Object.fromEntries(
      new URLSearchParams(window.location.hash.substring(1))
    );
    const res = await fetch("/api/login", {
      method: "post",
      body: new URLSearchParams({ access_token }),
    });
    if (res.ok) {
      console.log(res);
      reload();
      navigate("/");
    }
  }

  useEffect(() => {
    callBack();
  });

  return (
    <>
      <h1>Please wait</h1>
    </>
  );
}

function Profile() {
  const { userinfo } = useContext(ProfileContext);

  return (
    <>
      <h1>
        User profile: {userinfo.name} ({userinfo.email})
      </h1>
      {userinfo.picture && (
        <img src={userinfo.picture} alt={userinfo.name + " profile picture"} />
      )}
    </>
  );
}

function useLoading(loadingFunction) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [data, setData] = useState();

  async function load() {
    try {
      setLoading(true);
      setData(await loadingFunction());
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  return { loading, error, data };
}

function MovieCard({ movie: { title, plot, poster } }) {
  return (
    <>
      <h3>{title}</h3>
      {poster && <img src={poster} width={100} alt={"Movie poster"} />}
      <div>{plot}</div>
    </>
  );
}

function ListMovies() {
  const { loading, error, data } = useLoading(async () =>
    fetchJSON("/api/movies")
  );

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return (
      <div>
        <h1>Error</h1>
        <div>{error.toString()}</div>
      </div>
    );
  }

  return (
    <div>
      <Link to={"/"}>Back</Link>
      <h1>Movies in the database</h1>

      {data.map((movie) => (
        <MovieCard key={movie.title} movie={movie} />
      ))}
    </div>
  );
}

function AddNewMovie() {
  const [title, setTitle] = useState("");
  const [plot, setPlot] = useState("");
  const [year, setYear] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    await fetchJSON("/api/movies/new", {
      method: "post",
      json: { title, year, plot },
    });
    setTitle("");
    setYear("");
    setPlot("");
    navigate("/");
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Add Movie</h1>
      <div>
        Title:
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        Year:
        <input value={year} onChange={(e) => setYear(e.target.value)} />
      </div>
      <div>Plot:</div>
      <div>
        <textarea value={plot} onChange={(e) => setPlot(e.target.value)} />
      </div>
      <button>Submit</button>
    </form>
  );
}

function Application() {
  const [loading, setLoading] = useState(true);
  const [login, setLogin] = useState();
  useEffect(loadLoginInfo, []);

  async function loadLoginInfo() {
    setLoading(true);
    setLogin(await fetchJSON("/api/login"));
    setLoading(false);
  }

  useEffect(() => {
    console.log({ login });
  }, [login]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ProfileContext.Provider value={login}>
      <BrowserRouter>
        <Routes>
          <Route path={"/"} element={<FrontPage reload={loadLoginInfo} />} />
          <Route path={"/profile"} element={<Profile />} />
          <Route path={"/login"} element={<Login />} />
          <Route
            path={"/login/callback"}
            element={<LoginCallback reload={loadLoginInfo} />}
          />
          <Route path={"/movies"} element={<ListMovies />} />
          <Route path={"/movies/new"} element={<AddNewMovie />} />
        </Routes>
      </BrowserRouter>
    </ProfileContext.Provider>
  );
}

ReactDOM.render(<Application />, document.getElementById("app"));
