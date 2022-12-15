<?php
namespace Neos\TestNodeTypes\DataSources;

use Neos\Neos\Service\DataSource\AbstractDataSource;
use Neos\ContentRepository\Domain\Model\NodeInterface;

class NodeWithDependingPropertiesDataSource extends AbstractDataSource
{
    /**
     * @var string
     */
    static protected $identifier = 'node-with-depending-properties-data-source';

    /**
     * @param NodeInterface $node The node that is currently edited (optional)
     * @param array $arguments Additional arguments (key / value)
     * @return array
     */
    public function getData(NodeInterface $node = null, array $arguments = [])
    {
        $options = range(1, 10);

        $evenOrOdd = $arguments['evenOrOdd'];

        $filteredOptions = array_filter($options, function ($option) use ($evenOrOdd) {
            return match($evenOrOdd) {
                'even' => $option % 2 === 0,
                default => $option % 2 === 1,
            };
        });

        return array_map(
            function ($option) {
                return [
                    'label' => 'label_'. $option,
                    'value' => $option,
                ];
            },
            $filteredOptions
        );
    }
}
