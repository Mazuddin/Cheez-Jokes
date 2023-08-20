import React, { Component } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";


class JokeList extends Component {
  // Setting default props
  static defaultProps = {
    numJokesToGet: 5
  };

  // Constructor to initialize the component's state and bind methods
  constructor(props) {
    super(props);
    this.state = {
      jokes: []
    };

    // Binding methods to the component's instance
    this.generateNewJokes = this.generateNewJokes.bind(this);
    this.resetVotes = this.resetVotes.bind(this);
    this.toggleLock = this.toggleLock.bind(this);
    this.vote = this.vote.bind(this);
  }

  // Lifecycle method: Called after the component is inserted into the DOM
  componentDidMount() {
    if (this.state.jokes.length < this.props.numJokesToGet) {
      this.getJokes();
    }
  }

  // Lifecycle method: Called after the component updates
  componentDidUpdate() {
    if (this.state.jokes.length < this.props.numJokesToGet) {
      this.getJokes();
    }
  }

  // Method to fetch jokes from an API
  async getJokes() {
    try {
      let jokes = this.state.jokes;
      let jokeVotes = JSON.parse(window.localStorage.getItem("jokeVotes") || "{}");
      let seenJokes = new Set(jokes.map(j => j.id));

      while (jokes.length < this.props.numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" }
        });
        let { status, ...joke } = res.data;

        if (!seenJokes.has(joke.id)) {
          seenJokes.add(joke.id);
          jokeVotes[joke.id] = jokeVotes[joke.id] || 0;
          jokes.push({ ...joke, votes: jokeVotes[joke.id], locked: false });
        } else {
          console.log("duplicate found!");
        }
      }

      this.setState({ jokes });
      window.localStorage.setItem("jokeVotes", JSON.stringify(jokeVotes));
    } catch (e) {
      console.log(e);
    }
  }

  // Method to generate new jokes by filtering out locked jokes
  generateNewJokes() {
    this.setState(st => ({ jokes: st.jokes.filter(j => j.locked) }));
  }

  // Method to reset all vote counts
  resetVotes() {
    window.localStorage.setItem("jokeVotes", "{}");
    this.setState(st => ({
      jokes: st.jokes.map(joke => ({ ...joke, votes: 0 }))
    }));
  }


  vote(id, delta) {
    let jokeVotes = JSON.parse(window.localStorage.getItem("jokeVotes"));
    jokeVotes[id] = (jokeVotes[id] || 0) + delta;
    window.localStorage.setItem("jokeVotes", JSON.stringify(jokeVotes));
    this.setState(st => ({
      jokes: st.jokes.map(j =>
        j.id === id ? { ...j, votes: j.votes + delta } : j
      )
    }));
  }

  // Method to toggle the locked state of a joke
  toggleLock(id) {
    this.setState(st => ({
      jokes: st.jokes.map(j => (j.id === id ? { ...j, locked: !j.locked } : j))
    }));
  }

  // Method to render the component
  render() {
    let sortedJokes = [...this.state.jokes].sort((a, b) => b.votes - a.votes);
    let allLocked =
      sortedJokes.filter(j => j.locked).length === this.props.numJokesToGet;

    return (
      <div className="JokeList">
        {/* Button to get new jokes */}
        <button
          className="JokeList-getmore"
          onClick={this.generateNewJokes}
          disabled={allLocked}
        >
          Get New Jokes
        </button>
        
        <button className="JokeList-getmore" onClick={this.resetVotes}>
          Reset Vote Counts
        </button>

        {/* Rendering each joke */}
        {sortedJokes.map(j => (
          <Joke
            text={j.joke}
            key={j.id}
            id={j.id}
            votes={j.votes}
            vote={this.vote}
            locked={j.locked}
            toggleLock={this.toggleLock}
          />
        ))}

        {/* Displaying loading spinner if not all jokes are loaded */}
        {sortedJokes.length < this.props.numJokesToGet ? (
          <div className="loading">
            <i className="fa fa-cog fa-spin fa-3x fa-fw"></i>
            <span className="sr-only">Loading...</span>
          </div>
        ) : null}
      </div>
    );
  }
}

export default JokeList;
