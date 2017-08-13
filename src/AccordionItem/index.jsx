'use strict';

import className from 'classnames';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import uuid from 'uuid';

import AccordionItemBody from '../AccordionItemBody';
import AccordionItemTitle from '../AccordionItemTitle';

export default class AccordionItem extends Component {
  constructor(props) {
    super(props);
	this.getIsExpanded = this.getIsExpanded.bind(this);
	
    this.state = {
      maxHeight: this.getIsExpanded(props) ? 'none' : 0,
      overflow: this.getIsExpanded(props) ? 'visible' : 'hidden',
      duration: 300,
    };
  }

  componentWillMount() {
    this.uuid = this.props.uuid || uuid.v4();
  }

  componentDidMount() {
    this.setMaxHeight();
  }

  
  getIsExpanded(props) {
	  //if per item override is not set, use selection from parent
	  if (props.expanded != undefined && props.expanded == null && typeof props.expanded != 'undefined')
	  {
		  return props.expanded;		  
	  }
	  else
	  {
		  return props.isSelected;
	  }
  }
  
  componentDidUpdate(prevProps) {
    const { disabled, children } = this.props;
	const expanded = this.getIsExpanded(this.props);
	
    if (this.getIsExpanded(prevProps) !== expanded) {
      if (disabled) return;

      if (expanded) {
        this.handleExpand();
      } else {
        this.handleCollapse();
      }
    } else if (prevProps.children !== children) {
      this.setMaxHeight();
    }
  }

  handleExpand() {
    const { onExpand, slug } = this.props;

    this.setMaxHeight();

    if (onExpand) {
      slug ? onExpand(slug) : onExpand();
    }
  }

  handleCollapse() {
    const { onClose, slug } = this.props;

    this.setMaxHeight();

    if (onClose) {
      slug ? onClose(slug) : onClose();
    }
  }

  setMaxHeight() {
    const bodyNode = ReactDOM.findDOMNode(this.refs.body);
    const images = bodyNode.querySelectorAll('img');

    if (images.length > 0) {
      return this.preloadImages(bodyNode, images);
    }

    this.setState({
      maxHeight: this.getIsExpanded(this.props) ? bodyNode.scrollHeight + 'px' : 0,
      overflow: this.getIsExpanded(this.props) ? 'visible' : 'hidden',
    });
  }

  // Wait for images to load before calculating maxHeight
  preloadImages(node, images = []) {
    let imagesLoaded = 0;
    const imgLoaded = () => {
      imagesLoaded++;

      if (imagesLoaded === images.length) {
        this.setState({
          maxHeight: this.getIsExpanded(this.props) ? node.scrollHeight + 'px' : 0,
          overflow: 'hidden',
        });
      }
    };

    for (let i = 0; i < images.length; i += 1) {
      let img = new Image();
      img.src = images[i].src;
      img.onload = img.onerror = imgLoaded;
    }
  }
  

  getProps() {
    const props = {
      className: className(
        'react-sanfona-item',
        this.props.className,
        {
          'react-sanfona-item-expanded':
            this.getIsExpanded(this.props) && !this.props.disabled,
        },
        this.props.expandedClassName && {
          [this.props.expandedClassName]: this.getIsExpanded(this.props),
        },
        { 'react-sanfona-item-disabled': this.props.disabled },
        this.props.disabledClassName && {
          [this.props.disabledClassName]: this.props.disabled,
        }
      ),
      role: 'tabpanel',
      style: this.props.style,
    };

    if (this.getIsExpanded(this.props)) {
      props['aria-expanded'] = true;
    } else {
      props['aria-hidden'] = true;
    }

    return props;
  }

  render() {
    return (
      <div {...this.getProps()} ref="item">
        <AccordionItemTitle
          className={this.props.titleClassName}
          title={this.props.title}
          onClick={this.props.disabled ? null : this.props.onClick}
          titleColor={this.props.titleColor}
          uuid={this.uuid}
        />
        <AccordionItemBody
          maxHeight={this.state.maxHeight}
          duration={this.state.duration}
          className={this.props.bodyClassName}
          overflow={this.state.overflow}
          ref="body"
          uuid={this.uuid}
        >
          {this.props.children}
        </AccordionItemBody>
      </div>
    );
  }
}

AccordionItem.propTypes = {
  bodyClassName: PropTypes.string,
  className: PropTypes.string,
  expanded: PropTypes.bool,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  expandedClassName: PropTypes.string,
  style: PropTypes.object,
  titleClassName: PropTypes.string,
  disabled: PropTypes.bool,
  disabledClassName: PropTypes.string,
  uuid: PropTypes.string,
};
