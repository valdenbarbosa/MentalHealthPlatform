import React from 'react';

import ForumTableStyles from "./ForumTableStyles";

class ForumTableHead extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            headers: this.props.headers
        };
    }

    /**
     * Renders table header for forum table
     * @return  {React.Component}   Rendered component
     */
    createHeaders() {
        const headers = [];
        for (let i = 0; i < this.state.headers.length; i++) {
            const textAlign = (i == 0 | i == 1) ? "left" : "center";
            const headerStyle = Object.assign({}, ForumTableStyles.forumTableHeaderStyle, {textAlign: textAlign});
            
            headers.push(
                <th key={"header-" + i} style={headerStyle}>
                    {this.state.headers[i]}
                </th>
            );
        }
        return headers;
    }

    /**
     * Renders table header component for forum table
     * @return  {React.Component}   Rendered component
     */
    render() {
        return <thead><tr>{this.createHeaders()}</tr></thead>
    }
}

module.exports = ForumTableHead;