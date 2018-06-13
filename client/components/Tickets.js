import React, {Component} from 'react';
import '../css/main.css';


class Tickets extends Component {
    constructor(props) {
        super(props);

        this.openEditModal = this.openEditModal.bind(this);
    }

    // Function to trigger ticket editing modal
    openEditModal(ticketData){
        this.props.openEditModal(ticketData);
    }

    render() {
        let SprintTickets = () => this.props.tickets.map(ticket => {
            // console.log('Ticket object: ', ticket);
            let ticketId = ticket['id'];
            let issueType = ticket['fields']['issuetype']['name'];
            // console.log('Ticket type: ', issueType);
            var assignee;
            if(ticket['fields']['assignee'] !== null){
                assignee = ticket['fields']['assignee']['name'];
            } else {
                assignee = '';
            }
            // console.log('Assignee: ', assignee);
            let status = ticket['fields']['status']['name'];
            // console.log('Status: ', status);
            var resolution;
            if(ticket['fields']['resolution'] !== null){
                resolution = ticket['fields']['resolution']['name'];
            } else {
                resolution = '';
            }
            // console.log('Resolution: ', resolution);
            let description = ticket['fields']['description'];
            let summary = ticket['fields']['summary'];
            // let project = ticket['fields']['project']['key'];
            let url = 'https://jira.zmags.com/browse/' + ticket['key'];
            let ticketKey = ticket['key'];
            let isTicketTested;
            let testSteps;
            let ticket_test_outputs;
            let ticket_result;
            let ticket_integration;
            try{
                isTicketTested = ticket['testing']['ticket_if_tested'];
                testSteps = ticket['testing']['ticket_test_steps'];
                ticket_test_outputs = ticket['testing']['ticket_test_outputs'];
                ticket_result = ticket['testing']['ticket_result'];
                ticket_integration = ticket['testing']['ticket_integration'];
            } catch (e) {
                isTicketTested = '';
                testSteps = '';
                ticket_test_outputs = '';
                ticket_result = '';
                ticket_integration = '';
            }
            if (isTicketTested !== 1){
                description = '';
            }

            let ticketResultStyle;
            if(ticket_result === 'OK'){
                ticketResultStyle = {
                    backgroundColor: '#68cc6f'
                };
            } else if (ticket_result === 'FAIL') {
                ticketResultStyle = {
                    backgroundColor: '#ff5b58'
                };
            } else if (ticket_result === 'MISSED') {
                ticketResultStyle = {
                    backgroundColor: '#292828',
                    color: '#FFFFFF'
                };
            }

            let integrationResultStyle;
            if(ticket_integration === 'OK'){
                integrationResultStyle = {
                    backgroundColor: '#68cc6f'
                };
            } else if (ticket_integration === 'FAIL') {
                integrationResultStyle = {
                    backgroundColor: '#ff5b58'
                };
            } else if (ticket_integration === 'MISSED') {
                integrationResultStyle = {
                    backgroundColor: '#292828',
                    color: '#FFFFFF'
                };
            }

            if(this.props.showOnlyTested === true){
                if(isTicketTested === 1){
                    return(
                        <tr key={ticketId} className="ticket-list-row">
                            <th>{assignee}</th>
                            <th><a href={url}>{ticketKey}</a></th>
                            <th>{issueType}</th>
                            <th className="ticket-title">{summary}</th>
                            <th><div className="ticket-description">{description}</div></th>
                            <th>{status}</th>
                            <th>{resolution}</th>
                            <th>{isTicketTested}</th>
                            <th>{testSteps}</th>
                            <th>{ticket_test_outputs}</th>
                            <th style={ticketResultStyle}>{ticket_result}</th>
                            <th style={integrationResultStyle}>{ticket_integration}</th>
                            <th><div className="edit-button" onClick={() => {this.openEditModal(ticket)}}>Edit</div></th>
                        </tr>
                    )
                }
            } else {
                return(
                    <tr key={ticketId} className="ticket-list-row">
                        <th>{assignee}</th>
                        <th><a href={url}>{ticketKey}</a></th>
                        <th>{issueType}</th>
                        <th className="ticket-title">{summary}</th>
                        <th><div className="ticket-description">{description}</div></th>
                        <th>{status}</th>
                        <th>{resolution}</th>
                        <th>{isTicketTested}</th>
                        <th className="test-steps">{testSteps}</th>
                        <th className="test-outputs">{ticket_test_outputs}</th>
                        <th style={ticketResultStyle}>{ticket_result}</th>
                        <th style={integrationResultStyle}>{ticket_integration}</th>
                        <th><div className="edit-button" onClick={() => {this.openEditModal(ticket)}}>Edit</div></th>
                    </tr>
                )
            }
        });


        return (
            <table className="sprint-ticket-list">
                <tr className="title-row">
                    <th>Dev</th>
                    <th>URL</th>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Resolution</th>
                    <th>Tested</th>
                    <th>Test Steps</th>
                    <th>Test Outputs</th>
                    <th>Test Result</th>
                    <th>Integration</th>
                    <th>Edit</th>
                </tr>
                <SprintTickets />
            </table>
        );
    }
}

export default Tickets;
