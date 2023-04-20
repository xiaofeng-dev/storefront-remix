import { CreditCardIcon, PencilIcon, TrashIcon, TruckIcon } from '@heroicons/react/24/outline';
import { Link } from '@remix-run/react';
import clsx from 'clsx';
import { Address } from '~/generated/graphql';

type EditAddressProps = {
  address: Address;
  isActive?: boolean;
  onClickRemove?: () => void;
};

export default function EditAddressCard({
  address,
  isActive = false,
  onClickRemove,
}: EditAddressProps) {
  return (
    <>
      <div
        className={clsx(
          'border border-gray-200 p-5 min-h-[220px] h-full w-full flex flex-col justify-between gap-8 transition-colors',
          {
            'border-gray-900': isActive,
          },
        )}
      >
        <div className="flex justify-between">
          {/* Customer Data Section */}
          <div className="flex flex-col">
            <span className="text-left text-base-semi">{address.fullName}</span>
            {address.company && (
              <span className="text-small-regular text-gray-700">
                {address.company}
              </span>
            )}
            <div className="flex flex-col text-left text-base-regular mt-2">
              <span>
                {address.streetLine1}
                {address.streetLine2 && <span>, {address.streetLine2}</span>}
              </span>
              <span>
                {address.postalCode}, {address.city}
              </span>
              <span>
                {address.province && `${address.province}, `}
                {address.country?.code?.toUpperCase()}
              </span>
            </div>
          </div>
          {/* Default Shipping/Billing Section */}
          {(address.defaultShippingAddress || address.defaultBillingAddress) && (
            <div className='text-end text-gray-500 uppercase tracking-wider'>
              <span className="block text-sm font-medium">Default</span>
              <span className="block text-xs mt-1">
                {address.defaultShippingAddress && "Shipping"}
                {address.defaultShippingAddress && address.defaultBillingAddress && <><br />&amp;&nbsp;</>}
                {address.defaultBillingAddress && "Billing"}</span>
            </div>
          )}
        </div>
        {/* CRUD Actions */}
        <div className="flex flex-col md:flex-row items-start gap-4">
          <div className='flex items-center gap-4'>
            <Link
              role="button"
              preventScrollReset
              className="text-gray-700 flex items-center gap-x-2"
              to={`/account/addresses/${address.id}`}
            >
              <PencilIcon className="w-4 h-4"></PencilIcon>
              Edit
            </Link>
            <button
              type="button"
              className="text-gray-700 flex items-center gap-x-2"
              onClick={() => onClickRemove && onClickRemove()}
            >
              <TrashIcon className="w-4 h-4"></TrashIcon>
              Remove
            </button>
          </div>
          {(!address.defaultShippingAddress || !address.defaultBillingAddress) && (
            <div>
              <span className='text-gray-500 flex gap-4'>
                {!address.defaultShippingAddress && <button className='text-gray-700 flex items-center gap-2' title="Set as default shipping" onClick={() => alert("TODO")}><TruckIcon className="w-4 h-4"></TruckIcon>Shipping</button>}
                {!address.defaultBillingAddress && <button className='text-gray-700 flex items-center gap-2' title="Set as default billing" onClick={() => alert("TODO")}><CreditCardIcon className="w-4 h-4"></CreditCardIcon>Billing</button>}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
