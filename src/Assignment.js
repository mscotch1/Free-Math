import React from 'react';
import './App.css';
import Problem from './Problem.js';
import { ScoreBox } from './Problem.js';
import { problemListReducer } from './Problem.js';
import Button from './Button.js';
import { CloseButton, HtmlButton } from './Button.js';
import FreeMathModal from './Modal.js';

// editing assignmnt mode actions
const UNTITLED_ASSINGMENT = 'Untitled Assignment';

var PROBLEMS = 'PROBLEMS';
// student assignment actions
var ADD_PROBLEM = 'ADD_PROBLEM';

var BUTTON_GROUP = 'BUTTON_GROUP';
var STEPS = 'STEPS';
var PROBLEM_NUMBER = 'PROBLEM_NUMBER';
var PROBLEM_INDEX  = 'PROBLEM_INDEX';
var SET_CURRENT_PROBLEM = 'SET_CURRENT_PROBLEM';
var CURRENT_PROBLEM = 'CURRENT_PROBLEM';
var REMOVE_PROBLEM = 'REMOVE_PROBLEM';

var SHOW_TUTORIAL = "SHOW_TUTORIAL";

var SCORE = "SCORE";

// reducer for an overall assignment
function assignmentReducer(state, action) {
    if (state === undefined) {
        return {
            ASSIGNMENT_NAME : UNTITLED_ASSINGMENT,
            CURRENT_PROBLEM: 0,
            PROBLEMS : problemListReducer(undefined, action)
        };
    } else if (action.type === SET_CURRENT_PROBLEM) {
        return { ...state,
                 CURRENT_PROBLEM: action[PROBLEM_INDEX]
        };
    } else if (action.type === REMOVE_PROBLEM) {
        return { ...state,
                 PROBLEMS : problemListReducer(state[PROBLEMS], action),
                 CURRENT_PROBLEM: Math.max(0, state[CURRENT_PROBLEM] - 1)
        };
    } else if (action.type === ADD_PROBLEM) {
        return { ...state,
                 PROBLEMS : problemListReducer(state[PROBLEMS], action),
                 CURRENT_PROBLEM: state[PROBLEMS].length
        };

    } else {
        return { ...state,
                 PROBLEMS : problemListReducer(state[PROBLEMS], action)
        };
    }
}

class Assignment extends React.Component {
    state = { showModal: true };

    render() {
        // Microsoft injected the word iPhone in IE11's userAgent in order to try and fool
        // Gmail somehow. Therefore we need to exclude it. More info about this here and here.
        // https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
        var browserIsIOS = false; ///iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        var probList = this.props.value[PROBLEMS];
        var currProblem = this.props.value[CURRENT_PROBLEM];
        var addProblem = function() {
            var probs = this.props.value[PROBLEMS];
            var lastProb = probs[probs.length - 1];
            window.ga('send', 'event', 'Actions', 'edit',
                'Add Problem - last problem steps = ', lastProb[STEPS].length);
            window.store.dispatch({ type : ADD_PROBLEM});
        }.bind(this);
        return (
        <div style={{height: "100%", backgroundColor:"#f9f9f9", padding:"30px 30px 200px 30px"}}>
            <FreeMathModal
                showModal={this.state.showModal &&
                            probList[currProblem][SHOW_TUTORIAL]}
                content={(
                    <div>
                        <CloseButton onClick={function() {
                            this.setState({showModal: false});
                        }.bind(this)} />
                        <iframe title="Free Math Video"
                            src="https://www.youtube.com/embed/x6EiDUYJx_s"
                            allowFullScreen frameBorder="0"
                            className="tutorial-video"
                            ></iframe>
                    </div>
                    )
                } />
            <div>
            <div className="menubar-spacer-small"> </div>
            <div style={{ display: "flex", flexWrap: "wrap"}}>
            {probList.map(function(problem, problemIndex) {
                var probNum = problem[PROBLEM_NUMBER];
                var label;
                if (probNum.trim() !== '') {
                    label = "Problem " + probNum;
                } else {
                    label = "[Need to Set a Problem Number]";
                }
                return (
                    <div style={{
                        float : 'left',
                        WebkitBoxAlign: 'center',
                        alignItems: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        textAlign: 'center',
                        marginRight: '15px'}}
			key={"wrapper_" + problemIndex}>

                    {/* bit of a hack for alignment */
                        probList.filter(function(problem) { return problem[SCORE] !== undefined } ).length > 0
                            ? ( problem[SCORE] !== undefined /* show the real score box, or a fake hidden one for alignment */
                                ?
                                <ScoreBox value={problem} onClick={function() {
                                    window.store.dispatch(
                                        {type: SET_CURRENT_PROBLEM, PROBLEM_INDEX: problemIndex})}}/>
                                :
                                <div style={{visibility:"hidden"}}>
                                    <ScoreBox value={{SCORE: 1, POSSIBLE_POINTS: 1, STEPS: []}} />
                                </div>)
                            : null
                    }
                    <div>
                        <Button text={label} title={"View " + label} key={problemIndex} id={problemIndex}
                            className={(problemIndex === currProblem ?
                                            "fm-button-selected " : "") +
                                      "fm-button-left fm-button"}
                            onClick={function() {
                                window.store.dispatch(
                                    {type: SET_CURRENT_PROBLEM, PROBLEM_INDEX: problemIndex})}}
                        />
                        <HtmlButton text="&#10005;" title="Delete problem" key={problemIndex + " close"}
                            className={(problemIndex === currProblem ?
                                            "fm-button-selected " : "") +
                                      "fm-button-right fm-button"}
                            onClick={
                                function() {
                                    if (this.props.value[PROBLEMS].length === 1) {
                                        alert("Cannot delete the only problem in a document.");
                                        return;
                                    }
                                    if (!window.confirm("Are you sure you want to delete this problem?")) { return; }
                                    window.store.dispatch(
                                        { type : REMOVE_PROBLEM, PROBLEM_INDEX : problemIndex})
                            }.bind(this)}
                            content={(<img src="images/close.png" alt="x"/>)}
                        />
                    </div>
                    </div>
                );
            }.bind(this))}

            <div style={{
                float : 'left',
                WebkitBoxAlign: 'center',
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
                marginRight: '15px'}}>
                {/* bit of a hack for alignment */
                    probList.filter(function(problem) { return problem[SCORE] !== undefined } ).length > 0
                        ? (<div style={{visibility:"hidden"}}>
                            <ScoreBox value={{SCORE: 1, POSSIBLE_POINTS: 1, STEPS: []}} />
                           </div>)
                        : null
                }
                <Button text="Add Problem" style={{marginRight: "15px", backgroundColor: "#008000"}} onClick={function() {
                    addProblem();
                }}/>
            </div>
            {probList[currProblem][SHOW_TUTORIAL] ?
                    (<Button text="Reopen Demo Video" style={{backgroundColor: "#dc0031"}}
                        title="Reopen Demo Video"
                        onClick={function() {
                            this.setState({showModal: true});
                    }.bind(this)}/>) : null
            }
            </div>
            {probList[currProblem][SHOW_TUTORIAL] && !browserIsIOS ?
                (
                    <div className="answer-partially-correct"
                     style={{float: "right", display:"inline-block", padding:"5px", margin: "5px"}}>
                        <span>Work saves to the Downloads folder on your device.</span>
                    </div>) :
                null
            }
            {browserIsIOS ?
                (
                    <div className="answer-incorrect"
                     style={{float: "right", display:"inline-block", padding:"5px", margin: "5px"}}>
                        <span>Due to a browser limitation, you currently cannot save work in iOS. This demo can
                              be used to try out the experience, but you will need to visit the site on your Mac,
                              Widows PC, Chromebook or Android device to actually use the site.</span>
                    </div>) :
                null
            }

            <Problem value={probList[currProblem]}
                     id={currProblem}
                     buttonGroup={this.props.value[BUTTON_GROUP]}
            />
            </div>
            <br />
            {/* Replaced by better onscreen math keyboard with shortcuts in
                the title text of the buttons
            <Button onClick={this.toggleModal} text={this.state.showModal ? "Hide Symbol List" : "Show Available Symbol List" } />
                this.state.showModal ? <MathEditorHelp /> : null */}
        </div>
      )
    }
}

export { Assignment as default, assignmentReducer };
