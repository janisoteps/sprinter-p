// Stateless component to edit tickets, gets data from App.js and also updates data there
import React, {Component} from 'react';
import '../css/main.css';


class EditTicket extends Component {
    constructor(props) {
        super(props);

        this.openEditModal = this.openEditModal.bind(this);
        this.updateTicketModalTesting = this.updateTicketModalTesting.bind(this);
        this.saveTicketChanges = this.saveTicketChanges.bind(this);
        this.updateTicketModalIfTested = this.updateTicketModalIfTested.bind(this);
        this.resetTicket = this.resetTicket.bind(this);
    }

    // Opens the ticket editing modal
    openEditModal(ticketData){
        this.props.openEditModal(ticketData);
    }

    // Update testing data in App.js state, that will be used to send update request
    updateTicketModalTesting(change){
        this.props.updateTicketModalTesting(change.target);
    }

    // Change boolean if ticket is tested or not
    updateTicketModalIfTested(){
        this.props.updateTicketModalIfTested();
    }

    // Delete ticket data in local db in case it's corrupted due to jira
    resetTicket(key){
        fetch('/api/delete-ticket/' + key, {
            method: 'GET'
        }).then(response => {
                console.log('Ticket reset server response: ', response);
                this.props.loadSPrintTickets(this.props.sprintId, 1);
                this.openEditModal(0);
            }
        );
    }

    // Send ticket update to server
    saveTicketChanges(){
        var ticket_integration = this.props.testingData['ticket_integration'];
        if (ticket_integration === undefined){
            ticket_integration = '';
        }
        var ticket_result = this.props.testingData['ticket_result'];
        if (ticket_result === undefined){
            ticket_result = '';
        }
        var ticket_test_outputs = this.props.testingData['ticket_test_outputs'];
        if (ticket_test_outputs === undefined){
            ticket_test_outputs = '';
        }
        var ticket_test_steps = this.props.testingData['ticket_test_steps'];
        if (ticket_test_steps === undefined){
            ticket_test_steps = '';
        }
        var ticket_if_tested = this.props.testingData['ticket_if_tested'];
        if (ticket_if_tested === undefined){
            ticket_if_tested = '';
        }

        let data = {
            "ticket_key": this.props.ticketData['key'],
            "ticket_if_tested": ticket_if_tested,
            "ticket_test_steps": ticket_test_steps,
            "ticket_test_outputs": ticket_test_outputs,
            "ticket_result": ticket_result,
            "ticket_integration": ticket_integration,
            "sprint_id": this.props.sprintId
        };

        fetch('/api/update-ticket', {
            body: JSON.stringify(data), // must match 'Content-Type' header
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            headers: {
                'user-agent': 'Mozilla/4.0 MDN Example',
                'content-type': 'application/json'
            },
            method: 'POST'
        }).then(response => {
                console.log('Ticket update server response: ', response);
                this.props.loadSPrintTickets(this.props.sprintId, 1);
                this.openEditModal(0);
            }
        );
    }

    render() {
        // console.log('Rendering ticket editor, ticket data: ', this.props.ticketData);
        if(this.props.ticketData !== 0){
            var ticket = this.props.ticketData;
            // console.log('Ticket object: ', ticket);
            // var ticketId = ticket['id'];
            var issueType = ticket['fields']['issuetype']['name'];
            // console.log('Ticket type: ', issueType);
            var assignee;
            if(ticket['fields']['assignee'] !== null){
                assignee = ticket['fields']['assignee']['name'];
            } else {
                assignee = '';
            }
            // console.log('Assignee: ', assignee);
            var status = ticket['fields']['status']['name'];
            // console.log('Status: ', status);
            var resolution;
            if(ticket['fields']['resolution'] !== null){
                resolution = ticket['fields']['resolution']['name'];
            } else {
                resolution = '';
            }
            // console.log('Resolution: ', resolution);
            var description = ticket['fields']['description'];
            var summary = ticket['fields']['summary'];
            var project = ticket['fields']['project']['key'];
            var url = 'https://jira.zmags.com/browse/' + ticket['key'];
            var ticketKey = ticket['key'];
            try {
                var isTicketTested = this.props.testingData['ticket_if_tested'];
                var testSteps = this.props.testingData['ticket_test_steps'];
                var ticket_test_outputs = this.props.testingData['ticket_test_outputs'];
                var ticket_result = this.props.testingData['ticket_result'];
                var ticket_integration = this.props.testingData['ticket_integration'];
            } catch (e) {
                isTicketTested = '';
                testSteps = '';
                ticket_test_outputs = '';
                ticket_result = '';
                ticket_integration = '';
            }
        }

        return (
            <div>
                {(this.props.ticketData !== 0) && (
                    <div className="ticket-modal">
                        <div className="close-button" onClick={() => {this.openEditModal(ticket)}}>x</div>
                        <div className="reset-button" onClick={() => {this.resetTicket(ticketKey)}}></div>
                        <a href={url}><h3>{ticketKey} {summary}</h3></a>
                        <p>Issue type: <b>{issueType}</b> in project <b>{project}</b>, assigned to <b>{assignee}</b></p>
                        <p>Issue status: <b>{status}</b>, with resolution set to <b>{resolution}</b></p>
                        <p><b>Description:</b></p>
                        <p>{description}</p>
                        <div className="">
                            <input
                                type="checkbox"
                                name="ticket_if_tested"
                                checked={isTicketTested}
                                onChange={this.updateTicketModalIfTested}
                            />
                            Ticket is being tested</div>
                        <p>Test Steps:</p>
                        <textarea rows="8" className="edit-test-text-area" name="ticket_test_steps" value={testSteps} onChange={this.updateTicketModalTesting.bind(this)}></textarea>
                        <p>Test Outputs:</p>
                        <textarea rows="8" className="edit-test-text-area" name="ticket_test_outputs" value={ticket_test_outputs} onChange={this.updateTicketModalTesting.bind(this)}></textarea>
                        <p>Test Result:</p>
                        <input type="text" name="ticket_result" value={ticket_result} onChange={this.updateTicketModalTesting.bind(this)}></input>
                        <p>Integration Test Result:</p>
                        <input type="text" name="ticket_integration" value={ticket_integration} onChange={this.updateTicketModalTesting.bind(this)}></input>
                        <div className="ticket-save-button" onClick={this.saveTicketChanges}>SAVE</div>
                    </div>
                )}
            </div>
        )
    }
}

export default EditTicket;
