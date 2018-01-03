import React from 'react';
import './../assets/scss/quiz.scss';

import * as Utils from '../vendors/Utils.js';
import { addObjectives, objectiveAccomplished } from './../reducers/actions';

import QuizChoice from './QuizChoice.jsx';

export default class Quiz extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      selected_choices_ids: [],
      answered: false
    }
  }
  componentDidMount(){
    //Create objectives
    var objective = new Utils.objective({id:"MyQuiz",progress_measure:1,score:1});
    this.props.dispatch(addObjectives([objective]));
  }
  handleChoiceChange(choice){
    var newSelectedChoices = Object.assign([],this.state.selected_choices_ids);
    var indexOf = newSelectedChoices.indexOf(choice.id);
    if(indexOf==-1){
      newSelectedChoices.push(choice.id);
    } else {
      newSelectedChoices.splice(indexOf,1);
    }
    this.setState({selected_choices_ids: newSelectedChoices});
  }
  onAnswerQuiz(){
    //Calculate score
    var nChoices = this.props.quiz.choices.length;
    var correctAnswers = 0;
    var incorrectAnswers = 0;
    var blankAnswers = 0;

    for(var i=0; i<nChoices; i++){
      var choice = this.props.quiz.choices[i];
      if(this.state.selected_choices_ids.indexOf(choice.id)!=-1){
        //Answered choice
        if(choice.answer===true){
          correctAnswers += 1;
        } else {
          incorrectAnswers += 1;
        }
      } else {
        blankAnswers += 1;
      }
    }
    var scorePercentage = Math.max(0,(correctAnswers-incorrectAnswers)/this.props.quiz.choices.filter(function(c){return c.answer===true}).length);
    
    //Send data via SCORM
    var objective = this.props.tracking.objectives["MyQuiz"];
    this.props.dispatch(objectiveAccomplished(objective.id,objective.score*scorePercentage));
    
    //Mark quiz as answered
    this.setState({answered: true});
  }
  onResetQuiz(){
    this.setState({selected_choices_ids: [], answered: false});
  }
  render(){
    var choices = [];
    for(let i=0; i<this.props.quiz.choices.length; i++){
      choices.push(<QuizChoice key={"MyQuiz_" + "quiz_choice_" + i} choice={this.props.quiz.choices[i]} checked={this.state.selected_choices_ids.indexOf(this.props.quiz.choices[i].id)!=-1} handleChange={this.handleChoiceChange.bind(this)} quizAnswered={this.state.answered}/>);
    }
    return (
      <div className="quiz">
        <h1>{this.props.quiz.value}</h1>
        {choices}
        <div className="quizButtonsWrapper">
          <button className="answerQuiz" onClick={this.onAnswerQuiz.bind(this)} disabled={this.state.answered}>Answer</button>
          <button className="resetQuiz" onClick={this.onResetQuiz.bind(this)} disabled={!this.state.answered}>Reset</button>
        </div>
      </div>
    );
  }
}