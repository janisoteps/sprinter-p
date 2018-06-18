import React, {Component} from 'react';
import '../css/main.css';
import Tickets from './Tickets';
import EditTicket from './EditTicket';


class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sprints: [],
            sprintSelHeight: '30px',
            tickets: [],
            sprintName: '',
            sprintState: '',
            showOnlyTested: false,
            ticketModalData: 0,
            ticketModalTesting: {},
            sprintId: ''
        };

        this.sprintSelExpander = this.sprintSelExpander.bind(this);
        this.loadSPrintTickets = this.loadSPrintTickets.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.openEditModal = this.openEditModal.bind(this);
        this.updateTicketModalTesting = this.updateTicketModalTesting.bind(this);
        this.updateTicketModalIfTested = this.updateTicketModalIfTested.bind(this);
    }

    // Start with loading all sprints from Jira API, then trigger ticket load for latest sprint
    componentDidMount(){
        // console.log('Fetching sprints');
        fetch('/api/sprints', {
            method:'GET'
        })
            .then(response => response.json())
            .then(json => {
                // console.log(json['values']);
                this.setState({
                    sprints: json['values']
                });
                // console.log('comp mounting: ', this.state.sprints.length);
                this.loadSPrintTickets(this.state.sprints[this.state.sprints.length - 1]['id'], 1);
            }
        );
    }

    // Given sprint ID retrieve all tickets in sprint from Jira API
    loadSPrintTickets(sprintId, pageLoadFlag){
        var sprint = this.state.sprints.find(function (obj) { return obj['id'] === sprintId; });

        fetch('/api/tickets/' + sprintId, {
            method:'GET'
        })
            .then(response => response.json())
            .then(json => {
                    console.log(json);
                    this.setState({
                        tickets: json,
                        sprintName: sprint['name'],
                        sprintState: sprint['state'],
                        sprintId: sprintId
                    });
                    if(pageLoadFlag !== 1){
                        this.sprintSelExpander();
                    }
                }
            );
    }

    // Expands sprint selection drop down
    sprintSelExpander(closeFlag){
        // console.log('Expanding selector');
        if(closeFlag === 1){
            this.setState({
                sprintSelHeight: '30px'
            });
        } else if(this.state.sprintSelHeight === '800px') {
            this.setState({
                sprintSelHeight: '30px'
            });
        } else {
            this.setState({
                sprintSelHeight: '800px'
            });
        }
    }

    // Sets the filter change whether show all tickets or only the ones to be tested
    handleFilterChange() {
        let newValue = (this.state.showOnlyTested === "on" || this.state.showOnlyTested === true) ? false : true;
        this.setState({
            showOnlyTested: newValue
        });
    }

    // Trigger state change that opens ticket editing modal
    openEditModal(ticketData){
        // console.log('opening ticket editor');
        if(this.state.ticketModalData !== 0){
            this.setState({
                ticketModalData: 0,
                ticketModalTesting: 0
            });
        } else {
            if(ticketData['testing'] === undefined){
                this.setState({
                    ticketModalData: ticketData,
                    ticketModalTesting: {}
                });
            } else {
                this.setState({
                    ticketModalData: ticketData,
                    ticketModalTesting: ticketData['testing']
                });
            }
        }
    }

    // Update edited tickets testing data in state, later to be used to update Sqlite db
    updateTicketModalTesting(change){
        let name = change.name;
        let value = change.value;

        let testingData = this.state.ticketModalTesting;

        testingData[name] = value;

        this.setState({
            ticketModalTesting: testingData
        });
    }

    // The same as above but for boolean tick if ticket will be tested
    updateTicketModalIfTested(){
        let testingData = this.state.ticketModalTesting;

        testingData['ticket_if_tested'] = (testingData['ticket_if_tested'] === true || testingData['ticket_if_tested'] === 'true') ? false : true;

        this.setState({
            ticketModalTesting: testingData
        });
    }

    render() {

        let SprintSelector = () => this.state.sprints.map(sprint => {
                let sprintName = sprint['name'];
                let sprintKey = sprint['id'];

                // console.log('Name: ', sprintName);
                return(
                    <div key={sprintKey} className="sprint-selector-row" onClick={() => {this.loadSPrintTickets(sprintKey, 0);}}> { sprintName }</div>
                )
            });

        let sprintSelectorStyle = {
            backgroundColor: '#FFFFFF',
            top: '0',
            left: '0',
            width: '300px',
            borderRadius: '3px 0 0 3px',
            overflow: 'hidden',
            maxHeight: this.state.sprintSelHeight,
            display: 'inline-block',
            boxShadow: '1px 1px 3px 0 rgba(0, 0, 0, 0.4)',
            // zIndex: '10'
        };

        // console.log('Within render sprints: ', this.state.sprints.length);
        let SprintSelectorOrLoading = this.state.sprints.length > 0 ? (
            <div style={sprintSelectorStyle}>
                <SprintSelector/>
            </div>
        ) : (
            <div>
                <p>Loading</p>
            </div>
        );

        return (
            <div className="App">

                <div className="content">
                    <h3>Sprint showing: {this.state.sprintName}</h3>
                    <h5>Sprint state: {this.state.sprintState}</h5>
                    {this.state.tickets.length > 0 && (
                        <Tickets
                            showOnlyTested={this.state.showOnlyTested}
                            tickets={this.state.tickets}
                            openEditModal={(ticketData) => {this.openEditModal(ticketData);}}
                        />
                    )}
                </div>
                <div className="header-bar">
                    {SprintSelectorOrLoading}
                    <div className="sprint-selector-expand-button" onClick={() => {this.sprintSelExpander(0);}}></div>
                    <div className="only-tested-filter">
                        <input type="checkbox"
                               checked={this.state.showOnlyTested}
                               onChange={this.handleFilterChange.bind(this)}
                        />
                        Show only tickets that are tested</div>
                </div>

                <EditTicket
                    ticketData={this.state.ticketModalData}
                    testingData={this.state.ticketModalTesting}
                    updateTicketModalTesting={(change) => {this.updateTicketModalTesting(change);}}
                    updateTicketModalIfTested={() => {this.updateTicketModalIfTested();}}
                    openEditModal={(ticketData) => {this.openEditModal(ticketData);}}
                    sprintId={this.state.sprintId}
                    loadSPrintTickets={(sprintId, pageLoadFlag) => {this.loadSPrintTickets(sprintId, pageLoadFlag);}}
                />
            </div>
        );
    }
}

export default App;
