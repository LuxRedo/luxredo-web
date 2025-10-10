import React, { useState } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { string, bool, func } from 'prop-types';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import isEqual from 'lodash/isEqual';

import {
  Form,
  FieldTextInput,
  FieldSelect,
  H3,
  FieldPhoneNumberWithCountryInput,
  PrimaryButton,
} from '..';
import * as validators from '../../util/validators';
import getCountryCodes from '../../translations/countryCodes';
import { useConfiguration } from '../../context/configurationContext';
import css from './ShippingAddressForm.module.css';
import { updateShippingAddress } from './ShippingAddressForm.duck';

/**
 * ShippingAddressFormComponent is a component that allows the user to enter their shipping address.
 * It is used in the ShippingDetailsForm component.
 * @param {Object} onUpdateShippingAddress - The function to call when the address is validated.
 * @param {Object} initialValues - The initial values for the form.
 * @param {Object} updateShippingAddressInProgress - The state of the validate address in progress.
 * @param {Object} updateShippingAddressSuccess - The state of the validate address success.
 * @param {Object} updateShippingAddressError - The state of the validate address error.
 * @param {Object} className - The class name for the form.
 * @param {Object} rootClassName - The root class name for the form.
 * @param {boolean} showHeading - Whether to show the heading.
 * @param {Object} submitTitle - The title for the submit button.
 * @param {boolean} showShippingAddressFormError - Whether to show the shipping address form error.
 * @param {Function} successCallback - The function to call when the address is updated successfully.
 * @returns {JSX.Element} - The ShippingAddressFormComponent.
 */
export const ShippingAddressFormComponent = props => {
  const intl = useIntl();
  const config = useConfiguration();
  const [submittedValues, setSubmittedValues] = useState({});

  const title = intl.formatMessage({ id: 'ShippingAddressForm.title' });
  const requireText = intl.formatMessage({ id: 'ShippingAddressForm.requireText' });
  const updateButton = intl.formatMessage({ id: 'ShippingAddressForm.updateButton' });

  const nameLabel = intl.formatMessage({ id: 'ShippingAddressForm.nameLabel' });
  const namePlaceholder = intl.formatMessage({ id: 'ShippingAddressForm.namePlaceholder' });
  const nameRequired = validators.required(requireText);

  const phoneLabel = intl.formatMessage({ id: 'ShippingAddressForm.phoneLabel' });
  const phonePlaceholder = intl.formatMessage({ id: 'ShippingAddressForm.phonePlaceholder' });
  const invalidPhoneNumber = intl.formatMessage({ id: 'ShippingAddressForm.invalidPhoneNumber' });
  const phoneRequired = validators.required(requireText);
  const phoneValid = validators.validPhoneNumber(invalidPhoneNumber);

  const streetLabel = intl.formatMessage({ id: 'ShippingAddressForm.streetLabel' });
  const streetPlaceholder = intl.formatMessage({ id: 'ShippingAddressForm.streetPlaceholder' });
  const streetRequired = validators.required(requireText);

  const aptLabel = intl.formatMessage({ id: 'ShippingAddressForm.aptLabel' });
  const aptPlaceholder = intl.formatMessage({ id: 'ShippingAddressForm.aptPlaceholder' });

  const cityLabel = intl.formatMessage({ id: 'ShippingAddressForm.cityLabel' });
  const cityPlaceholder = intl.formatMessage({ id: 'ShippingAddressForm.cityPlaceholder' });
  const cityRequired = validators.required(requireText);

  const zipLabel = intl.formatMessage({ id: 'ShippingAddressForm.zipLabel' });
  const zipPlaceholder = intl.formatMessage({ id: 'ShippingAddressForm.zipPlaceholder' });
  const zipRequired = validators.required(requireText);

  const stateLabel = intl.formatMessage({ id: 'ShippingAddressForm.stateLabel' });
  const statePlaceholder = intl.formatMessage({ id: 'ShippingAddressForm.statePlaceholder' });
  const stateRequired = validators.required(requireText);

  const countryLabel = intl.formatMessage({ id: 'ShippingAddressForm.countryLabel' });
  const countryPlaceholder = intl.formatMessage({ id: 'ShippingAddressForm.countryPlaceholder' });
  const countryRequired = validators.required(requireText);

  // Use the language set in config.localization.locale to get the correct translations of the country names
  const countryCodes = getCountryCodes(config.localization.locale);

  return (
    <FinalForm
      {...props}
      onSubmit={async values => {
        const { onSubmit } = props;
        const response = await onSubmit(values);
        if (response?.data?.data) {
          setSubmittedValues(values);
          props.successCallback?.();
        }
      }}
      render={fieldRenderProps => {
        const {
          rootClassName,
          className,
          formId,
          handleSubmit,
          form,
          updateShippingAddressError,
          updateShippingAddressInProgress,
          showHeading = true,
          submitTitle,
          values,
          showShippingAddressFormError,
        } = fieldRenderProps;

        const submittedOnce = Object.keys(submittedValues).length > 0;
        const pristineSinceLastSubmit = submittedOnce && isEqual(values, submittedValues);

        const classes = classNames(rootClassName || css.root, className);

        return (
          <Form className={classes} onSubmit={handleSubmit}>
            {showHeading && <H3>{title}</H3>}
            {showShippingAddressFormError && (
              <p className={css.error}>
                {intl.formatMessage({ id: 'ShippingAddressForm.formError' })}
              </p>
            )}
            <div className={css.formRow}>
              <FieldTextInput
                id={`${formId}.name`}
                name="name"
                className={css.fullField}
                type="text"
                label={nameLabel}
                placeholder={namePlaceholder}
                validate={nameRequired}
                onUnmount={() => form.change('name', undefined)}
              />
            </div>
            <div className={css.formRow}>
              <FieldPhoneNumberWithCountryInput
                id={`${formId}.phone`}
                autoComplete="shipping phoneNumber"
                name="phone"
                className={classNames(css.field, css.fullField)}
                label={phoneLabel}
                placeholder={phonePlaceholder}
                validate={validators.composeValidators(phoneRequired, phoneValid)}
                onUnmount={() => form.change('phone', undefined)}
              />
            </div>

            <div className={css.formRow}>
              <FieldTextInput
                id={`${formId}.street`}
                name="street1"
                className={css.field}
                type="text"
                label={streetLabel}
                placeholder={streetPlaceholder}
                validate={streetRequired}
                onUnmount={() => form.change('street1', undefined)}
              />

              <FieldTextInput
                id={`${formId}.apt`}
                name="streetNo"
                className={css.field}
                type="text"
                label={aptLabel}
                placeholder={aptPlaceholder}
                onUnmount={() => form.change('streetNo', undefined)}
              />
            </div>
            <div className={css.formRow}>
              <FieldTextInput
                id={`${formId}.city`}
                name="city"
                className={css.field}
                type="text"
                label={cityLabel}
                placeholder={cityPlaceholder}
                validate={cityRequired}
                onUnmount={() => form.change('city', undefined)}
              />

              <FieldTextInput
                id={`${formId}.zip`}
                name="zip"
                className={css.field}
                type="text"
                label={zipLabel}
                placeholder={zipPlaceholder}
                validate={zipRequired}
                onUnmount={() => form.change('zip', undefined)}
              />
            </div>
            <div className={css.formRow}>
              <FieldTextInput
                id={`${formId}.state`}
                name="state"
                className={css.field}
                type="text"
                label={stateLabel}
                placeholder={statePlaceholder}
                validate={stateRequired}
                onUnmount={() => form.change('state', undefined)}
              />

              <FieldSelect
                id={`${formId}.country`}
                name="country"
                className={css.field}
                label={countryLabel}
                validate={countryRequired}
              >
                <option disabled value="">
                  {countryPlaceholder}
                </option>
                {countryCodes.map(country => {
                  return (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  );
                })}
              </FieldSelect>
            </div>

            {updateShippingAddressError && (
              <p className={css.error}>
                {updateShippingAddressError?.error?.error ||
                  intl.formatMessage({ id: 'ShippingAddressForm.validateError' })}
              </p>
            )}

            <PrimaryButton
              className={css.validateButton}
              type="submit"
              ready={pristineSinceLastSubmit}
              inProgress={updateShippingAddressInProgress}
            >
              {submitTitle ?? updateButton}
            </PrimaryButton>
          </Form>
        );
      }}
    />
  );
};

ShippingAddressFormComponent.propTypes = {
  className: string,
  rootClassName: string,
  showShippingAddressFormError: bool,
  successCallback: func,
};

const mapStateToProps = state => {
  const {
    updateShippingAddressInProgress,
    updateShippingAddressSuccess,
    updateShippingAddressError,
  } = state.ShippingAddressForm;

  const currentUser = state.user.currentUser;

  const initialValues = currentUser?.attributes?.profile?.protectedData?.shippingAddress;

  return {
    initialValues,
    updateShippingAddressInProgress,
    updateShippingAddressSuccess,
    updateShippingAddressError,
  };
};

const mapDispatchToProps = dispatch => ({
  onSubmit: address => dispatch(updateShippingAddress(address)),
});

const ShippingAddressForm = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(ShippingAddressFormComponent);

export default ShippingAddressForm;
